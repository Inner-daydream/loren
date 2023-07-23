#!/bin/bash

# inject the sops key if running locally
if [ -z "$CODESPACE_NAME" ]; then
    read -s -p 'Enter sops AGE private key: ' SOPS_AGE_KEY
fi
echo $SOPS_AGE_KEY > /home/vscode/.sops/key.txt

cd loren-server && npm install
cd ../infra/terraform && terraform init