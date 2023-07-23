#!/bin/sh

# inject the sops key if running locally
if [ -z "$CODESPACE_NAME" ]; then
    read -p -s 'Enter sops AGE private key: ' SOPS_AGE_KEY
fi
echo $SOPS_AGE_KEY > /root/.sops/key.txt

cd loren-server && npm install