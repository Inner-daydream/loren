#!/bin/sh

# sed -i is not portable between GNU and BSD sed
sedi () {
    if ! sed --version >/dev/null 2>&1; then
        sed -i "" "$@"
    else
        sed -i -- "$@"
    fi
}
# exit when any command fails
set -e

# sending a discord notification
send_notification() {
    curl -H "Content-Type: application/json" \
        -X POST \
        -d "{\"content\": \"$1\"}" \
        "$DISCORD_WEBHOOK"
}

send_notification "starting a new cluster deployment"
# Set up remote vpc access
echo "creating the vpc.."
hcloud network create --ip-range "$VPC_SUBNET" --name "$CLUSTER_NAME" 1>/dev/null
hcloud network add-subnet "$CLUSTER_NAME"  --ip-range "$VPC_SUBNET" --network-zone "$NETWORK_ZONE" --type cloud 1>/dev/null

echo "deploying the bastion host..."
terraform -chdir=terraform apply -auto-approve 1>/dev/null

# Substitute env vars in config file
echo "deploying the cluster..."
config_file="$1"
tmpfile=$(mktemp)
trap '{ rm -f -- "$tmpfile"; }' EXIT
< "$config_file"  envsubst > "$tmpfile"

# Create cluster
hetzner-k3s create --config "$tmpfile" 1>/dev/null
rm -f "$tmpfile"

echo "removing the public ip used to provision the cluster..."
k3s_servers=$(hcloud server list --selector "cluster == k3s-prod" -o columns=id -o noheader)
for server in $k3s_servers; do
    primary_ips=$(hcloud primary-ip list -o json \
        | jq -r --argjson SERVER_ID "$server" '.[] | select(.assignee_id==$SERVER_ID) | .id')
    hcloud server poweroff "$server" --poll-interval "5s" 1>/dev/null
    for primary_ip in $primary_ips; do
        hcloud  primary-ip delete "$primary_ip" 1>/dev/null
    done
done

# Lock down the access to the cluster from the internet, allow only the bastion host
echo "Restricting access to the cluster..."
hcloud firewall delete-rule --direction in --protocol tcp --port 22 \
     --source-ips 0.0.0.0/0 k3s-prod --description "Allow SSH port" 1>/dev/null
hcloud firewall delete-rule --direction in --protocol tcp --port 6443 \
     --source-ips 0.0.0.0/0 k3s-prod --description "Allow port 6443 (Kubernetes API server)" 1>/dev/null

# try to restart the servers until timeout expires, use the commented exemple below to restart the servers
echo "Restarting the servers..."
timeout=10
set +e
total_servers=$(echo "$k3s_servers" | wc -l)
while true; do
    if [ $timeout -eq 0 ]; then
        echo "Timeout expired, the servers are not restarting"
        exit 1
    fi
    restarted_servers=0
    for server in $k3s_servers; do
        status=$(hcloud server list -o json | jq -r --argjson SERVER_ID "$server" '.[] | select(.id==$SERVER_ID) | .status')
        if [ "$status" != "running" ] && [ "$status" != "starting" ]; then
            hcloud server poweron "$server" --poll-interval "5s" 1>/dev/null
        else
            restarted_servers=$((restarted_servers + 1))
        fi
    done
    if [ "$restarted_servers" -eq "$total_servers" ]; then # check if all servers have restarted
        break # break the loop (all servers have restarted)
    fi
    timeout=$((timeout - 1))
    sleep 10
done
set -e



# update kubeconfig with the new private ip of the controlplane
echo "Updating kubeconfig..."
master=$(hcloud server list -o json | jq -r '.[] | select(.labels.role=="master") | .private_net[0].ip')
sedi "s/server: .*/server: https:\/\/$master:6443/" "kubeconfig"

echo "Waiting for the cluster to be ready..."
until kubectl get nodes 1>/dev/null 2>&1; do
    sleep 5
done
