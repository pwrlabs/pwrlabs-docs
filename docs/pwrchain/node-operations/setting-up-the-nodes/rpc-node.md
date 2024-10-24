---
title: RPC Node
sidebar_position: 2
---

# How to Run an RPC Node

**Requirements:**

- **CPU**: 1 vCPU
- **Memory**: 1 GB RAM
- **Disk**: 25 GB HDD or higher
- **Open TCP Ports**: 8231, 8085
- **Open UDP Port**: 7621

### Setup on Ubuntu Server:

1. **Update OS**:

```shell
sudo apt update
```

2. **Install Java**:

```shell
apt install openjdk-19-jre-headless
```

3. **Install the validator node software and config file**:

```shell
wget https://github.com/pwrlabs/PWR-Validator-Node/raw/main/validator.jar
wget https://github.com/pwrlabs/PWR-Validator-Node/raw/main/config.json
```

4. **Set Up your Password**:

```shell
sudo nano password
```

- Enter your desired password.
- Press `Ctrl + x` to close.
- Press `Y` to confirm saving the password.

5. Running in the Background: If you wish to run the node in the background, ensuring it remains active after closing the terminal, utilize the `nohup` command:

```shell
nohup sudo java -jar validator.jar --rpc
```

Congratulations, you've now set up and run a PWR Chain RPC node!
