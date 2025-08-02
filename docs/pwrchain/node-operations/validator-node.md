---
title: Validator Node
sidebar_position: 1
---

# How to Run a Validator Node

**Requirements:**

- **CPU**: 2 vCPU
- **Memory**: 4 GB RAM  
- **Disk**: 100 GB HDD or higher
- **Bandwidth**: 400Mbps download or higher. 800Mbps upload or higher
- **Open TCP Ports**: 8231, 8085, 9864
- **Open UDP Ports**: 7621

### Setup on Ubuntu Server:

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

Replace `<YOUR_SERVER_IP>` with your server's actual IP.

```shell
nohup sudo java --enable-native-access=ALL-UNNAMED -jar validator.jar --ip <your nodes ip here> --password password &
```

> **NOTE:** Make sure ports 8085 and 8231 are open for TCP.

7. **Get Your Address**

```shell
java -jar validator.jar get-address password
```

8. **Become a Validator Node**

- Initially, your node will synchronize with the blockchain but will not assume validator responsibilities until it possesses staked PWR Coins.
- To obtain sufficient PWR Coins for staking, [apply to become a testnet validator](https://docs.google.com/forms/d/1ImUgk8JaKCwJR-7xiBNaA8-mb604CYdSKJfMRHacA60). Once approved, you can use our discord bot to claim 100k PWR to stake.
- After claiming your coins, your node will initiate a transaction to enlist as a validator.

9. **Checking your nodes logs**

If you wish to check your nodes log, you can do so using the following command:

```bash
tail -n 1000 nohup.out -f
```

### Importing an Existing Wallet

To import your old wallet using this update:

```bash
java -jar validator.jar import-seed-phrase <password file here> <seed phrase here>
```

**Example:**

```bash
java -jar validator.jar import-seed-phrase password public neither spider scare diagram knife fragile road kit guess crucial bachelor
```


Congratulations, you've now set up and run a PWR Chain validator node!
