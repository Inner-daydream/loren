#!/bin/bash

# inject the sops key if running locally
if [ -z "$CODESPACE_NAME" ]; then
    read -s -p 'Enter sops AGE private key: ' SOPS_AGE_KEY
fi
echo $SOPS_AGE_KEY > /home/vscode/.sops/key.txt
WORKSPACE_ROOT=$(pwd)
git config pull.rebase true
cd $WORKSPACE_ROOT/loren-server && npm install
cd $WORKSPACE_ROOT/infra/terraform && direnv exec . terraform init