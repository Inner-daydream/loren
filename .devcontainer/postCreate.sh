#!/bin/bash

# inject the sops key if running locally
if [ -z "$CODESPACE_NAME" ]; then
    read -s -p 'Enter sops AGE private key: ' SOPS_AGE_KEY
fi
echo $SOPS_AGE_KEY > /home/vscode/.sops/key.txt
WORKSPACE_ROOT=$(pwd)
cd $WORKSPACE_ROOT/loren-server && npm install
cd $WORKSPACE_ROOT/infra/terraform && terraform init
cd $WORKSPACE_ROOT/infra && sudo tailscaled --tun=userspace-networking