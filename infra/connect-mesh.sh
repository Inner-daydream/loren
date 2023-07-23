#!/bin/sh

if [ -z $TAILSCALE_CLIENT_ID ]; then
    read -p 'Enter Tailscale Client ID: ' TAILSCALE_CLIENT_ID
fi
if [ -z $TAILSCALE_CLIENT_SECRET ]; then
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
sudo tailscale up --authkey=$api_key