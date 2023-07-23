#!/bin/sh

# check if running in codespace
if [ -z "$CODESPACE_NAME" ]; then
    read -p 'Enter sops AGE private key: ' SOPS_AGE_KEY
    else 
    echo ""
fi
echo $sops_key > /root/.sops/key.txt