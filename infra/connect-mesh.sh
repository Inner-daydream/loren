#!/bin/bash

if [ -z $TAILSCALE_CLIENT_ID ] && [ -z $1 ]; then
    read -p 'Enter Tailscale Client ID: ' TAILSCALE_CLIENT_ID
fi
if [ -z $TAILSCALE_CLIENT_SECRET ] && [ -z $2 ]; then
    read -s -p 'Enter Tailscale Client Secret: ' TAILSCALE_CLIENT_SECRET
fi



export tailscale_token=$(
    curl -s "https://api.tailscale.com/api/v2/oauth/token" \
    -d "client_id=$TAILSCALE_CLIENT_ID"  \
    -d "client_secret=$TAILSCALE_CLIENT_SECRET" \
    | jq -r .access_token
)

api_key=$(curl -s -u $tailscale_token: "https://api.tailscale.com/api/v2/tailnet/-/keys" -X POST --data '
  {
    "capabilities": {
      "devices": {
        "create": {
          "preauthorized": true,
          "ephemeral": true,
          "tags": [ "tag:prod" ]
        }
      }
    }
  }' | jq -r .key
)
sudo nohup tailscaled --tun=userspace-networking >/dev/null &>/dev/null &
sudo tailscale up --authkey=$api_key > /dev/null 1>/dev/null &