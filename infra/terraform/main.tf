terraform {
  required_providers {
    hcloud = {
      source = "hetznercloud/hcloud"
    }
    tailscale = {
      source  = "tailscale/tailscale"
    }
  }
  required_version = ">= 0.13"
  cloud {
    organization = "loren"
    workspaces {
      name = "loren"
    }
  }
}

variable "default_hetzner_user" {
  default = "root"
}
variable "ssh_public_key_path" {
  type = string
}
variable "vpc_subnet" {
  type = string
}
variable "hcloud_token" {
  sensitive = true
}
variable "gateway_hostname" {
  default = "vpc-gateway"
}

variable "location" {
  default = "fsn1"
}
variable "server_type" {
  default = "cax11"
}
variable "cluster_name" {
  default = "k3s-prod"
}

variable "tailscale_api_key" {
  type = string
}
variable "tailscale_oauth_client_id" {
  type = string
}
variable "tailscale_oauth_client_secret" {
  type = string
}

variable "tailscale_org" {
  type = string
}
variable "tailscale_tailnet" {
  type = string
}
  
# Configure the Hetzner Cloud Provider
provider "hcloud" {
  token = var.hcloud_token
}

provider "tailscale" {
  api_key = var.tailscale_api_key
  tailnet = var.tailscale_org
}


resource "hcloud_firewall" "vpc_access" {
  name = "vpc_access"
  rule {
    direction = "in"
    protocol  = "icmp"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "22"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

}

resource "hcloud_ssh_key" "default" {
  name       = var.cluster_name
  public_key = file(var.ssh_public_key_path)
}

data "hcloud_network" "cluster-network" {
  name = var.cluster_name
}

resource "hcloud_server" "vpc_gateway" {
  name        = var.gateway_hostname
  image       = "103908130"
  server_type = var.server_type
  location  = var.location
  user_data = templatefile("assets/tailscale.sh", {
    tailscale_auth_token = tailscale_tailnet_key.auth_key.key
    tailscale_hostname = var.gateway_hostname
  })
  network {
    network_id = data.hcloud_network.cluster-network.id
  }
  ssh_keys = [ hcloud_ssh_key.default.id ]
  firewall_ids = [hcloud_firewall.vpc_access.id]

  public_net {
    ipv4_enabled = true
    ipv6_enabled = false
  }
  provisioner "local-exec" {
    command = "./assets/check-tailscale-status.sh ${self.name}"
  }
}
resource "tailscale_tailnet_key" "auth_key" {
  reusable      = true
  ephemeral     = true
  preauthorized = true
  expiry        = 3600
  tags = [ "tag:prod" ]
}

# output gateway ip 
output "gateway_ip" {
  value = hcloud_server.vpc_gateway.ipv4_address
}

data "tailscale_device" "vpc_gateway" {
  name = "${var.gateway_hostname}.${var.tailscale_tailnet}"
  wait_for = "60s"
  depends_on = [
    hcloud_server.vpc_gateway
  ]
}


resource "tailscale_device_subnet_routes" "vpc_route" {
  device_id = data.tailscale_device.vpc_gateway.id
  routes = [
    var.vpc_subnet,
  ]
  depends_on = [
    data.tailscale_device.vpc_gateway,
    hcloud_server.vpc_gateway
  ]

}