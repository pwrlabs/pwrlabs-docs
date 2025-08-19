---
title: RPC Node
sidebar_position: 2
---

# How to Run an RPC Node

**Requirements:**

- **CPU**: 2 vCPU
- **Memory**: 4 GB RAM  
- **Disk**: 100 GB HDD or higher
- **Bandwidth**: 400Mbps download or higher. 800Mbps upload or higher
- **Open TCP Ports**: 8231, 8085, 9864
- **Open UDP Ports**: 7621

### Setup on Ubuntu Server

1. **Update OS**:

```shell
sudo apt update
```

2. **Install Java**:

```shell
sudo apt install default-jdk
```

3. **Open Required Ports**:

**For UFW (Uncomplicated Firewall):**

```shell
sudo ufw allow 8231/tcp
sudo ufw allow 8085/tcp
sudo ufw allow 9864/tcp
sudo ufw allow 7621/udp
sudo ufw reload
```

**For iptables:**

```bash
sudo iptables -A INPUT -p tcp --dport 8231 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8085 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 9864 -j ACCEPT
sudo iptables -A INPUT -p udp --dport 7621 -j ACCEPT
sudo netfilter-persistent save
```

> **Note**: If you're using a cloud provider, you may also need to configure the ports in their firewall/security group settings.

4. **Install the validator node software and config file**:

```shell
wget https://github.com/pwrlabs/PWR-Validator/releases/download/15.63.9/validator.jar
wget https://github.com/pwrlabs/PWR-Validator/raw/refs/heads/main/config.json
```

5. **Setup your password**:

```shell
echo "your password here" > password
```

6. **Run the Node**:

Running in the Background: If you wish to run the node in the background, ensuring it remains active after closing the terminal, utilize the `nohup` command:

```shell
nohup sudo java -jar validator.jar --rpc
```

Congratulations, you've now set up and run a PWR Chain RPC node!
