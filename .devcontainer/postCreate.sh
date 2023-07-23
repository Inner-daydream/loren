#!/bin/sh

# check if running in codespace
if [ -z "$CODESPACE_NAME" ]; then
    read -p 'Enter sops AGE private key: ' SOPS_AGE_KEY
fi
echo $SOPS_AGE_KEY > /root/.sops/key.txt