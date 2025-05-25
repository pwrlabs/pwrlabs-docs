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
- You have finished reading the [**SDK** guides](/developers/sdks/overview).

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
    ```bash
    go get github.com/pwrlabs/pwrgo github.com/joho/godotenv
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```bash
    dotnet new console -o MyApp
    cd MyApp
    dotnet add package PWR
    dotnet add package DotNetEnv
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
</Tabs>

> **NOTE**: Rust developers will face some issues with file formatting compared to other languages, you can check out [this project on Github](https://github.com/keep-pwr-strong/rust-dapps/tree/main/message_dapp).

## Step 2: ENV setup to load the wallet

Create a `.env` file in your project folder and add your wallet's **`SEED_PHRASE`** in the file.

```bash
SEED_PHRASE="ADD_YOUR_SEED_PHRASE_HERE"
```

## Step 3: Fetch Messages

To fetch messages from the PWR Chain, we'll use the method provided by the PWR SDK to retrieve transactions within a range of blocks.

Create a file in your project and add the following code:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRJS } = require("@pwrjs/core");

    // Setting up your wallet in the SDK
    const rpc = new PWRJS("https://pwrrpc.pwrlabs.io/");

    async function sync() {
        let startingBlock = 880920;
        const vidaId = 1234;

        const loop = async () => {
            try {
                const latestBlock = await rpc.getLatestBlockNumber();
                let effectiveLatestBlock = latestBlock > startingBlock + 1000 ? startingBlock + 1000 : latestBlock;

                if (effectiveLatestBlock > startingBlock) {
                    // fetch the transactions in `vidaId = 1234`
                    const txns = await rpc.getVMDataTransactions(startingBlock, effectiveLatestBlock, vidaId);
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
    from pwrpy.models.Transaction import VidaDataTransaction
    import json
    import time

    # Setting up the rpc api
    rpc = PWRPY("https://pwrrpc.pwrlabs.io/")

    vida_id = 1234 # Replace with your VIDA's ID
    starting_block = rpc.get_latest_block_number()

    def handler_messages(txn: VidaDataTransaction):
        try:
            sender = txn.sender
            data_hex = txn.data
            # Remove the '0x' prefix and decode the hexadecimal data to bytes data
            data_bytes = bytes.fromhex(data_hex)
            # Convert the bytes data to UTF-8 string as json
            obj = json.loads(data_bytes.decode('utf-8'))
            if 'message' in obj:
                print(f"\nMessage from {sender}: {obj['message']}")
        except Exception as e:
            print('Error in sync:', e)
            time.sleep(1)

    def sync():
        rpc.subscribe_to_vida_transactions(vida_id, starting_block, handler=handler_messages)
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::RPC;
    use pwr_rs::transaction::types::VidaDataTransaction;
    use std::sync::Arc;

    fn handler_messages(txn: VidaDataTransaction) {
        // Get the address of the transaction sender
        let sender = txn.sender;
        // Get the data sent in the transaction (In Hex Format)
        let data = txn.data;
        // Convert data string to bytes
        let data_str = String::from_utf8(data).unwrap();
        let object: serde_json::Value = serde_json::from_str(&data_str).unwrap();
        let obj_map = object.as_object().unwrap();

        // Check the action and execute the necessary code
        for (key, value) in obj_map {
            if key.to_lowercase() == "message" {
                let message_str = value.as_str().unwrap();
                println!("\nMessage from {}: {}", sender, message_str);
            } else {
                // Handle other data fields if needed
            }
        }
    }

    pub async fn sync() {
        // Setting up the rpc api
        let rpc = RPC::new("https://pwrrpc.pwrlabs.io/").await.unwrap();
        let rpc = Arc::new(rpc);

        let starting_block = rpc.get_latest_block_number().await.unwrap();
        let vida_id: u64 = 1234;

        rpc.subscribe_to_vida_transactions(vida_id, starting_block, handler_messages);
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "fmt"
        "log"
        "encoding/json"
        "encoding/hex"
        "github.com/pwrlabs/pwrgo/rpc"
    )


    func handlerMessages(transaction rpc.VidaDataTransaction) {
        sender := transaction.Sender
        dataHex := transaction.Data
        // Remove the '0x' prefix and decode the hexadecimal data to bytes data
        dataBytes, _ := hex.DecodeString(dataHex)
        // convert the bytes data to UTF-8 string as json
        var obj map[string]interface{}
        if err := json.Unmarshal(dataBytes, &obj); err != nil {
            log.Println("Error parsing JSON:", err)
        }

        if message, ok := obj["message"]; ok {
            fmt.Printf("\nMessage from %s: %s\n", sender, message)
        } else {
            // Handle other data fields if needed
        }
    }

    func Sync() {
        rpc := rpc.SetRpcNodeUrl("https://pwrrpc.pwrlabs.io")
        startingBlock := rpc.GetLatestBlockNumber()
        vidaId := 1234 // Replace with your VIDA's ID

        _ = rpc.SubscribeToVidaTransactions(
            vidaId,
            startingBlock,
            handlerMessages,
        )
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using System.Text.Json;
    using PWR;
    using PWR.Utils;

    namespace MyApp;

    public class Syncer
    {
        private static readonly RPC _rpc = new RPC("https://pwrrpc.pwrlabs.io/");
        private const ulong vidaId = 1234;

        public static async Task Sync()
        {
            ulong startingBlock = await _rpc.GetLatestBlockNumber();

            VidaTransactionSubscription subscription = _rpc.SubscribeToVidaTransactions(vidaId, startingBlock, (transaction) => {
                string sender = transaction.Sender;
                string data = transaction.Data;
                byte[] dataBytes = Convert.FromHexString(data);
                var jsonDoc = JsonDocument.Parse(dataBytes);
                var root = jsonDoc.RootElement;

                if (root.TryGetProperty("message", out var messageElement))
                {
                    string message = messageElement.GetString();
                    Console.WriteLine($"\nMessage from {sender}: {message}");
                }
                else
                {
                    // Handle other data fields if needed
                }
            });
        }
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
</Tabs>

## Step 4: Build the DApp

Now that we have the individual components for sending messages, and fetching messages, let's put them all together in a complete application.

The final implementation should look like this:

1. Run the project to fetch and send messages.
2. The application keeps fetching messages without stopping.
3. Write a message and click `Enter` to send.
4. Fetch the message to you.

Create a file in your project and add the following code:

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
        const vidaId = 1234;
        await sync();

        const messageLoop = () => {
            rl.question("", async (message) => {
                const object = { message };
                // Send the VIDA data
                const response = await wallet.sendVMDataTxn(vidaId, Buffer.from(JSON.stringify(object), 'utf8'));
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
    from pwrpy.pwrwallet import Wallet
    from sync_messages import sync
    from dotenv import load_dotenv
    import json
    import threading
    import os
    load_dotenv()

    # Setting up your wallet in the SDK
    seed_phrase = os.getenv("SEED_PHRASE")
    wallet = Wallet.new(seed_phrase)
    vida_id = 1234

    def main():
        threading.Thread(target=sync, daemon=True).start()

        while True:
            message = input("")
            obj = {"message": message}
            data = json.dumps(obj).encode('utf-8')
            
            # Send the VIDA data
            response = wallet.send_vida_data(vida_id, data)
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
        let seed_phrase = env::var("SEED_PHRASE").unwrap();
        let wallet = Wallet::new(&seed_phrase);
        let vida_id: u64 = 1234;
        let stdin = io::stdin();
        let reader = BufReader::new(stdin);
        let mut lines = reader.lines();
        
        spawn(sync());
        
        while let Some(message) = lines.next_line().await? {
            let obj = serde_json::json!({ "message": message });
            let data = serde_json::to_vec(&obj)?;
            let fee_per_byte = (wallet.get_rpc().await).get_fee_per_byte().await.unwrap();

            // Send the VIDA data
            wallet.send_vida_data(vida_id, data, fee_per_byte).await;
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
        "github.com/pwrlabs/pwrgo/wallet"
        "github.com/joho/godotenv"
    )

    func main() {
        // Setting up your wallet in the SDK
        godotenv.Load()
        seedPhrase := os.Getenv("SEED_PHRASE")
        wallet, err := wallet.New(seedPhrase)
        if err != nil {
            fmt.Println("Error getting the wallet:", err)
            return
        }
        vidaId := 1234 // Replace with your VIDA's ID

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
            feePerByte := wallet.GetRpc().GetFeePerByte()

            // Send the VIDA data
            tx := wallet.SendVidaData(vidaId, jsonData, feePerByte)
            if tx.Success {
                fmt.Printf("Transaction Hash: %s\n", tx.Hash)
            } else {
                fmt.Println("Error:", tx.Error)
            }
        }
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using System.Text.Json;
    using PWR;
    using PWR.Models;
    using DotNetEnv;

    namespace MyApp;

    public class Program
    {
        private const ulong vidaId = 1234;

        public static async Task Main()
        {
            // Setting up your wallet in the SDK
            Env.Load();
            string seedPhrase = Environment.GetEnvironmentVariable("SEED_PHRASE");
            var wallet = new Wallet(seedPhrase);

            _ = Task.Run(async () => await Syncer.Sync());

            while (true)
            {
                Console.Write("\nEnter your message: ");
                string message = Console.ReadLine();

                try
                {
                    var messageData = new { message = message };
                    byte[] dataBytes = JsonSerializer.SerializeToUtf8Bytes(messageData);
                    ulong feePerByte = await wallet.GetRpc().GetFeePerByte();

                    // Send the VIDA data
                    WalletResponse response = await wallet.SendVidaData(vidaId, dataBytes, feePerByte);

                    if (response.Success)
                    {
                        Console.WriteLine($"Transaction Hash: {response.Hash}");
                    }
                    else
                    {
                        Console.WriteLine($"Error: {response.Error}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error processing message: {ex.Message}");
                }
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

## Step 5: Run the Application

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
    go mod tidy
    go run .
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```bash
    dotnet run
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
