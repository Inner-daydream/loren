#!/bin/bash
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
sudo sysctl -p /etc/sysctl.d/99-tailscale.conf
curl -fsSL https://tailscale.com/install.sh | sh
#the auth token is passed in as an environment variable
#shellcheck disable=SC2154
tailscale up --advertise-routes=10.0.0.0/16 --authkey "${tailscale_auth_token}" --hostname "${tailscale_hostname}"