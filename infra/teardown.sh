#!/bin/sh
echo "sending a discord notification..."
send_notification() {
    curl -H "Content-Type: application/json" \
        -X POST \
        -d "{\"content\": \"$1\"}" \
        "$DISCORD_WEBHOOK"
}
send_notification "deleting the cluster"
echo "Dettaching the bastion from the tailscale network..."
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null  -o ConnectTimeout=10 \
    -i "$SSH_PRIVATE_KEY_PATH" \
    root@"$(terraform output -state ./terraform/terraform.tfstate -raw gateway_ip)" \
    "tailscale logout" >/dev/null 2>&1

echo "Deleting the bastion and the ssh key..."
terraform -chdir=terraform state rm tailscale_device_subnet_routes.vpc_route 1>/dev/null
terraform -chdir=terraform destroy -auto-approve 1>/dev/null


k3s_servers=$(hcloud server list --selector "cluster == k3s-prod" -o columns=id -o noheader)
echo "Deleting the cluster..."
for server in $k3s_servers; do
    hcloud server delete "$server" 1>/dev/null
done

echo "Deleting the vpc..."
hcloud network delete "$CLUSTER_NAME" 1>/dev/null

echo "Deleting the firewall..."
hcloud firewall delete "$CLUSTER_NAME" 1>/dev/null

echo "Deleting the placement groups..."
placement_groups=$(hcloud placement-group list -o json \
    | jq -r --arg CLUSTER_NAME "$CLUSTER_NAME" '.[] | select(.name | contains($CLUSTER_NAME)) | .id')

for placement_group in $placement_groups; do
    hcloud placement-group delete "$placement_group" 1>/dev/null
done
send_notification "cluster deleted"