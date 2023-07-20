#!/bin/sh
# Peforms ping until it succeeds
tailscale_host="$1"
reachable=false
while [ "$reachable" = false ]; do
    ips=$(tailscale status --json 2>/dev/null | jq -r --arg TAILSCALE_HOST "$tailscale_host" '.Peer[] | select(.HostName==$TAILSCALE_HOST) | .TailscaleIPs[]' 2>/dev/null)
    for ip in $ips; do
        if ping -c 1 "$ip" >/dev/null 2>&1 -t 2; then
          reachable=true
          break
        fi
      done
done