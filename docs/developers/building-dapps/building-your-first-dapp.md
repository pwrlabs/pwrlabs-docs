---
title: Building your first Decentralized Application
sidebar_position: 1
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Building your first Decentralized Application

A decentralized application (dApp) is one that doesn't rely on any single party to run it. It can be run by anyone, anytime, anywhere, and used for its intended purpose without relying on a central authority or backend servers.

In this tutorial, we will be building a simple, fully decentralized messaging application on the PWR Chain. This messaging application doesn't rely on any company to run it and doesn't use any conventional backend servers or databases. The only infrastructure it uses is the PWR Chain, and the parties who run it are the users themselves.

## Prerequisites

Before starting, make sure you have the following:

- A development environment set up for your preferred programming language.
- PWR SDK installed and configured in your project.
- You have finished reading the [**SDK** guides](/developers/sdks/installing-and-importing-pwr-sdk).

## Step 1: Set Up the Project

Create a new project in your preferred programming language, and add the necessary dependencies, including the PWR SDK, to your project's configuration file or build tool.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```bash
    mkdir messageDapp && cd messageDapp
    npm init --yes
    npm install @pwrjs/core dotenv readline
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```bash
    mkdir message_dapp && cd message_dapp
    python3 -m venv venv
    source venv/bin/activate
    pip3 install pwrpy python-dotenv
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```bash
    cargo new message_dapp && cd message_dapp
    cargo add pwr-rs dotenvy serde_json
    cargo add tokio@1.0 --features full
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    go get github.com/pwrlabs/pwrgo github.com/joho/godotenv
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
</Tabs>

> **NOTE**: Rust developers will face some issues with file formatting compared to other languages, you can check out [this project on Github](https://github.com/keep-pwr-strong/rust-dapps/tree/main/message_dapp).

## Step 2: ENV setup to load the wallet

Create a `.env` file in your project folder and add your wallet's **`PRIVATE_KEY`** in the file.

```bash
PRIVATE_KEY="ADD_YOUR_PRIVATE_KEY_HERE"
```

## Step 3: Send Messages

To send a message, we'll use the method provided by the PWR SDK to send a transaction with the message data.

Create a `send_message` file in your project and add the following code:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRWallet } = require("@pwrjs/core");
    require('dotenv').config();

    // Setting up your wallet in the SDK
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new PWRWallet(privateKey);

    async function sendMessage() {
        const obj = { message: "Hello World!" };
        const data = Buffer.from(JSON.stringify(obj), 'utf8');
        const vmId = 1234;

        const res = await wallet.sendVMDataTxn(vmId, data);
        console.log(res.transactionHash);
    }
    sendMessage();
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrwallet import PWRWallet
    from dotenv import load_dotenv
    import json
    import os
    load_dotenv()

    # Setting up your wallet in the SDK
    private_key = os.getenv("PRIVATE_KEY")
    wallet = PWRWallet(private_key)

    def send_message():
        obj = {"message": "cool"}
        data = json.dumps(obj).encode('utf-8')
        vm_id = 1234

        # Sending the VM data transaction
        res = wallet.send_vm_data_transaction(vm_id, data)
        print(res.data)
    send_message()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::Wallet;
    use dotenvy::dotenv;
    use std::env;
    use serde_json::json;

    async fn send_message() {
        dotenv().ok();
        // Setting up your wallet in the SDK
        let private_key = env::var("PRIVATE_KEY").unwrap();
        let wallet = Wallet::from_hex(&private_key).unwrap();

        let obj = json!({ "message": "lfg" });
        let data = serde_json::to_vec(&obj).unwrap(); // Serialize to JSON bytes
        let vm_id = 1234;
        let res = wallet.send_vm_data(vm_id, data).await;
        println!("{}", res);
    }

    #[tokio::main]
    pub async fn main() {
        send_message().await;
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "fmt"
        "os"
        "encoding/json"
        "github.com/joho/godotenv"
        "github.com/pwrlabs/pwrgo/wallet"
    )

    func SendMessage() {
        // Setting up your wallet in the SDK
        godotenv.Load()
        privateKey := os.Getenv("PRIVATE_KEY")
        wallet := wallet.FromPrivateKey(privateKey)

        vmId := 123
        data, _ := json.Marshal(map[string]string{"message": "Hello World!"})

        tx := wallet.SendVMData(vmId, data)

        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Printf("Failed to send transaction: %s\n", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
</Tabs>

## Step 4: Fetch Messages

To fetch messages from the PWR Chain, we'll use the method provided by the PWR SDK to retrieve transactions within a range of blocks.

Create a `sync_messages` file in your project and add the following code:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRJS } = require("@pwrjs/core");

    // Setting up your wallet in the SDK
    const rpc = new PWRJS("https://pwrrpc.pwrlabs.io/");

    async function sync() {
        let startingBlock = 880920;
        const vmId = 1234;

        const loop = async () => {
            try {
                const latestBlock = await rpc.getLatestBlockNumber();
                let effectiveLatestBlock = latestBlock > startingBlock + 1000 ? startingBlock + 1000 : latestBlock;

                if (effectiveLatestBlock > startingBlock) {
                    // fetch the transactions in `vmId = 1234`
                    const txns = await rpc.getVMDataTransactions(startingBlock, effectiveLatestBlock, vmId);
                    for (let txn of txns) {
                        const sender = txn.sender;
                        const dataHex = txn.data;
                        // Remove the '0x' prefix and decode the hexadecimal data to bytes data
                        const data = Buffer.from(dataHex.substring(2), 'hex');
                        // convert the bytes data to UTF-8 string as json
                        const object = JSON.parse(data.toString('utf8'));

                        Object.keys(object).forEach(key => {
                            if (key.toLowerCase() === "message") {
                                console.log(`\nMessage from ${sender}: ${object[key]}`);
                            } else {
                                // Handle other data fields if needed
                            }
                        });
                    }
                    startingBlock = effectiveLatestBlock + 1;
                }
                setTimeout(loop, 1000); // Wait 1 second before the next loop
            } catch (e) {
                console.error(e);
            }
        };
        loop();
    }
    module.exports = { sync };
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrsdk import PWRPY
    import json
    import time

    # Setting up the rpc api
    pwr = PWRPY()

    def sync():
        starting_block = 880920 
        vm_id = 1234

        while True:
            try:
                latest_block = pwr.get_latest_block_number()
                effective_latest_block = min(latest_block, starting_block + 1000)

                if effective_latest_block >= starting_block:
                    # Fetch the transactions in `vmId = 1234`
                    txns = pwr.get_vm_data_txns(starting_block, effective_latest_block, vm_id)
                    for txn in txns:
                        sender = txn.sender
                        data_hex = txn.data
                        # Remove the '0x' prefix and decode the hexadecimal data to bytes data
                        data_bytes = bytes.fromhex(data_hex[2:])
                        # Convert the bytes data to UTF-8 string as json
                        obj = json.loads(data_bytes.decode('utf-8'))
                        if 'message' in obj:
                            print(f"\nMessage from {sender}: {obj['message']}")

                    starting_block = effective_latest_block + 1
                time.sleep(1) # Wait 1 second before the next loop
            except Exception as e:
                print('Error in sync:', e)
                time.sleep(1)
    # sync()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::RPC;
    use std::time::Duration;
    use tokio::time::sleep;
    use serde_json::Value;

    pub async fn sync() {
        // Setting up the rpc api
        let rpc = RPC::new("https://pwrrpc.pwrlabs.io/").await.unwrap();

        let mut starting_block: u64 = 880920;
        let vm_id: u64 = 1234;

        loop {
            let latest_block = rpc.get_latest_block_number().await.unwrap();
            let effective_latest_block = if latest_block > starting_block + 1000 {
                starting_block + 1000
            } else {
                latest_block
            };

            if effective_latest_block >= starting_block {
                // Fetch the transactions in `vmId = 1234`
                let txns = rpc.get_vm_data_transactions(starting_block, effective_latest_block, vm_id).await.unwrap();
                for txn in txns {
                    let sender = txn.sender;
                    let data = txn.data; // txn.data is Vec<u8>
                    // Convert data bytes to UTF-8 string without explicit error handling
                    let data_str = String::from_utf8(data).unwrap();
                    // Parse JSON data without explicit error handling
                    let object: Value = serde_json::from_str(&data_str).unwrap();
                    let obj_map = object.as_object().unwrap();

                    for (key, value) in obj_map {
                        if key.to_lowercase() == "message" {
                            let message_str = value.as_str().unwrap();
                            println!("\nMessage from {}: {}", sender, message_str);
                        } else {
                            // Handle other data fields if needed
                        }
                    }
                }
                starting_block = effective_latest_block + 1;
            }
            sleep(Duration::from_secs(1)).await; // Wait 1 second before the next loop
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "fmt"
        "log"
        "time"
        "encoding/json"
        "encoding/hex"
        "github.com/pwrlabs/pwrgo/rpc"
    )

    func Sync() {
        startingBlock := 880920
        vmId := 1234

        loop := func() {
            for {
                latestBlock := rpc.GetLatestBlockNumber()

                effectiveLatestBlock := latestBlock
                if latestBlock > startingBlock+1000 {
                    effectiveLatestBlock = startingBlock + 1000
                }

                if effectiveLatestBlock > startingBlock {
                    // fetch the transactions in `vmId = 1234`
                    transactions := rpc.GetVmDataTransactions(startingBlock, effectiveLatestBlock, vmId)

                    for _, txn := range transactions {
                        sender := txn.Sender
                        dataHex := txn.Data
                        // Remove the '0x' prefix and decode the hexadecimal data to bytes data
                        dataBytes, _ := hex.DecodeString(dataHex[2:])
                        // convert the bytes data to UTF-8 string as json
                        var obj map[string]interface{}
                        if err := json.Unmarshal(dataBytes, &obj); err != nil {
                            log.Println("Error parsing JSON:", err)
                            continue
                        }

                        if message, ok := obj["message"]; ok {
                            fmt.Printf("\nMessage from %s: %s\n", sender, message)
                        } else {
                            // Handle other data fields if needed
                        }
                    }

                    startingBlock = effectiveLatestBlock + 1
                }

                time.Sleep(1 * time.Second) // Wait 1 second before the next loop
            }
        }

        go loop()
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
</Tabs>

## Step 5: Build the DApp

Now that we have the individual components for sending messages, and fetching messages, let's put them all together in a complete application.

The final implementation should look like this:

1. Run the project to fetch and send messages.
2. The application keeps fetching messages without stopping.
3. Write a message and click `Enter` to send.
4. Fetch the message to you.

Create a `dapp` file in your project and add the following code:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRWallet } = require("@pwrjs/core");
    const { sync } = require("./sync_messages.js");
    const readline = require("readline");
    require('dotenv').config();

    // Setting up your wallet in the SDK
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new PWRWallet(privateKey);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    async function main() {
        const vmId = 1234;
        await sync();

        const messageLoop = () => {
            rl.question("", async (message) => {
                const object = { message };
                // Send the VM data
                const response = await wallet.sendVMDataTxn(vmId, Buffer.from(JSON.stringify(object), 'utf8'));
                !response.success && console.log('FAILED!');
                messageLoop(); // Recursively ask for the next message
            });
        };

        messageLoop();
    }
    main();
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrwallet import PWRWallet
    from sync_messages import sync
    from dotenv import load_dotenv
    import json
    import threading
    import os
    load_dotenv()

    # Setting up your wallet in the SDK
    private_key = os.getenv("PRIVATE_KEY")
    wallet = PWRWallet(private_key)
    vm_id = 1234

    def main():
        threading.Thread(target=sync, daemon=True).start()

        while True:
            message = input("")
            obj = {"message": message}
            data = json.dumps(obj).encode('utf-8')
            
            # Send the VM data
            response = wallet.send_vm_data_transaction(vm_id, data)
            if response.success==False:
                print('FAILED!')
    main()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    pub mod sync_messages;
    use pwr_rs::Wallet;
    use tokio::io::{self, AsyncBufReadExt, BufReader};
    use tokio::spawn;
    use sync_messages::sync;
    use dotenvy::dotenv;
    use std::env;

    #[tokio::main]
    pub async fn main() -> Result<(), Box<dyn std::error::Error>> {
        dotenv().ok();
        // Setting up your wallet in the SDK
        let private_key = env::var("PRIVATE_KEY").unwrap();
        let wallet = Wallet::from_hex(&private_key).unwrap();
        let vm_id: u64 = 1234;
        let stdin = io::stdin();
        let reader = BufReader::new(stdin);
        let mut lines = reader.lines();
        
        spawn(sync());
        
        while let Some(message) = lines.next_line().await? {
            let obj = serde_json::json!({ "message": message });
            let data = serde_json::to_vec(&obj)?;

            // Send the VM data
            wallet.send_vm_data(vm_id, data).await;
        }
        Ok(())
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "fmt"
        "bufio"
        "os"
        "encoding/json"
        "github.com/joho/godotenv"
        "github.com/pwrlabs/pwrgo/wallet"
    )

    func main() {
        // Setting up your wallet in the SDK
        godotenv.Load()
        privateKey := os.Getenv("PRIVATE_KEY")
        wallet := wallet.FromPrivateKey(privateKey)
        vmId := 1234

        go Sync()

        reader := bufio.NewReader(os.Stdin)

        for {
            fmt.Print("Enter your message: ")
            message, _ := reader.ReadString('\n')
            message = message[:len(message)-1]

            object := map[string]string{"message": message}
            jsonData, err := json.Marshal(object)
            if err != nil {
                fmt.Println("Failed to encode message:", err)
                continue
            }

            // Send the VM data
            tx := wallet.SendVMData(vmId, jsonData)
            if tx.Success {
                fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
            } else {
                fmt.Println("Error:", tx.Error)
            }
        }
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
</Tabs>

Finally, we enter a loop where the user can input messages, and each message is sent as a transaction to the PWR Chain using the `sendVmDataTransaction` method.

## Step 6: Run the Application

To run the messaging application, add the following command:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```bash
    node dapp.js
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```bash
    python3 dapp.py
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```bash
    cargo run
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```bash
    go run dapp.go
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```bash
    ```
</TabItem>
</Tabs>

And that's it! You have now built a simple, decentralized messaging application on the PWR Chain. Users can run this application on their own machines, and all the messages will be stored and retrieved from the PWR Chain itself.

## Conclusion

In this tutorial, we explored the process of building a decentralized messaging application on the PWR Chain using the PWR SDK. We covered creating or loading a wallet, fetching messages from the chain, sending messages as transactions, and putting all the components together in a complete application.

Remember, this is a basic example to demonstrate the concepts. In a production-ready application, you would need to consider additional factors such as security, error handling, performance optimization, and user interface design.

The power of decentralized applications lies in their ability to operate independently, without relying on a central authority or infrastructure. By leveraging the capabilities of the PWR Chain, developers can build innovative and resilient applications that empower users and promote decentralization.
