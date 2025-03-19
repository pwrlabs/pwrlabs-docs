---
title: Using Conduit Nodes

sidebar_position: 2
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Using Conduit Nodes

Conduit nodes play a crucial role in enabling decentralized applications (dApps) and virtual machines (VMs) on the PWR Chain to interact with the base layer and with each other. These nodes act as intermediaries, translating transaction requests from dApps and VMs into actual transactions on the PWR Chain.

In this guide, we'll walk you through the process of setting up your application to communicate with conduit nodes and send transaction requests.

## Prerequisites

Before starting, make sure you have the following:

- A development environment set up for your preferred programming language.
- PWR SDK installed and configured in your project.
- You've finished reading about [**Conduits** Nodes](/pwrchain/core-components/nodes/conduits-node).
- You have finished reading the [**SDK** guides](/developers/sdks/installing-and-importing-pwr-sdk).

## Step 1: Set Up the Project

Create a new project in your preferred programming language, and add the necessary dependencies, including the PWR SDK, to your project's configuration file or build tool.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```bash
    mkdir conduits && cd conduits
    npm init --yes
    npm install @pwrjs/core dotenv readline express
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```bash
    mkdir conduits && cd conduits
    python3 -m venv venv
    source venv/bin/activate
    pip3 install pwrpy python-dotenv Flask
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```bash
    cargo new conduits && cd conduits
    cargo add pwr-rs dotenvy serde_json warp
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

> **NOTE**: Rust developers will face some issues with file formatting compared to other languages, you can check out [this project on Github](https://github.com/keep-pwr-strong/rust-dapps/tree/main/conduits).

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
        const obj = { message: "please send me pwr" };
        const data = Buffer.from(JSON.stringify(obj), 'utf8'); // Serialize to JSON bytes
        const vmId = 123;

        // Sending the VM data transaction
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
        obj = {"message": "please send me pwr"}
        data = json.dumps(obj).encode('utf-8') # Serialize to JSON bytes
        vm_id = 123

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

    pub async fn send_message() {
        dotenv().ok();
        // Setting up your wallet in the SDK
        let private_key = env::var("PRIVATE_KEY").unwrap();
        let wallet = Wallet::from_hex(&private_key).unwrap();

        let obj = json!({ "message": "please send me pwr" });
        let data = serde_json::to_vec(&obj).unwrap(); // Serialize to JSON bytes
        let vm_id = 123;
        // Sending the VM data transaction
        let res = wallet.send_vm_data(vm_id, data).await;
        println!("{}", res);
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
        data, _ := json.Marshal(map[string]string{"message": "please send me pwr"})

        // Sending the VM data transaction
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

## Step 4: Transactions Awaiting Approval

The `Transactions` class manages the list of transactions awaiting approval:

Once the data is fetched from PWR Chain the transactions associated with sending 100 pwr to the user will be stored in the transactionsAwaitingApproval array.

Create a `transaction` file in your project and add the following code:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    class Transactions {
        static transactionsAwaitingApproval = [];

        static add(txn) {
            this.transactionsAwaitingApproval.push(txn);
        }

        static remove(txn) {
            this.transactionsAwaitingApproval = this.transactionsAwaitingApproval.filter(
                tx => JSON.stringify(tx) !== JSON.stringify(txn)
            );
        }

        static getPendingTransactions() {
            return [...this.transactionsAwaitingApproval];
        }
    }
    module.exports = { Transactions };
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    class Transactions:
        transactions_awaiting_approval = []

        @classmethod
        def add(cls, txn):
            cls.transactions_awaiting_approval.append(txn)

        @classmethod
        def remove(cls, txn):
            cls.transactions_awaiting_approval = [
                tx for tx in cls.transactions_awaiting_approval 
                if tx != txn
            ]

        @classmethod
        def get_pending_transactions(cls):
            return cls.transactions_awaiting_approval.copy()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use std::sync::{Mutex, Arc};
    use serde_json::Value;

    pub struct Transactions {
        transactions_awaiting_approval: Arc<Mutex<Vec<Value>>>,
    }

    impl Transactions {
        pub fn new() -> Self {
            Transactions {
                transactions_awaiting_approval: Arc::new(Mutex::new(Vec::new())),
            }
        }

        pub fn add(&self, txn: Value) {
            let mut txns = self.transactions_awaiting_approval.lock().unwrap();
            txns.push(txn);
        }

        pub fn remove(&self, txn: &Value) {
            let mut txns = self.transactions_awaiting_approval.lock().unwrap();
            *txns = txns.iter()
                .filter(|&tx| tx != txn) // Comparing JSON values directly
                .cloned()
                .collect();
        }

        pub fn get_pending_transactions(&self) -> Vec<Value> {
            let txns = self.transactions_awaiting_approval.lock().unwrap();
            txns.clone()
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "sync"
    )

    type Transactions struct {
        transactionsAwaitingApproval [][]byte
        mu                           sync.Mutex
    }

    var PendingTransactions = &Transactions{}

    // Add adds a transaction in []byte format to the list of awaiting approvals.
    func (t *Transactions) Add(txn []byte) {
        t.mu.Lock()
        defer t.mu.Unlock()
        t.transactionsAwaitingApproval = append(t.transactionsAwaitingApproval, txn)
    }

    // Remove removes a transaction in []byte format from the list of awaiting approvals.
    func (t *Transactions) Remove(txn []byte) {
        t.mu.Lock()
        defer t.mu.Unlock()
        newList := [][]byte{}
        for _, tx := range t.transactionsAwaitingApproval {
            if string(tx) != string(txn) {
                newList = append(newList, tx)
            }
        }
        t.transactionsAwaitingApproval = newList
    }

    // GetPendingTransactions retrieves a copy of the transactions awaiting approval.
    func (t *Transactions) GetPendingTransactions() [][]byte {
        t.mu.Lock()
        defer t.mu.Unlock()
        return append([][]byte{}, t.transactionsAwaitingApproval...)
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
</Tabs>

## Step 5: Fetch Messages

To fetch messages from the PWR Chain, we'll use the method provided by the PWR SDK to retrieve transactions within a range of blocks.

Create a `sync_messages` file in your project and add the following code:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRJS, PWRWallet, TransactionBuilder } = require("@pwrjs/core");
    const { Transactions } = require("./transaction.js");
    require('dotenv').config();

    // Setting up your wallet in the SDK
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new PWRWallet(privateKey);
    // Setting up the rpc api
    const rpc = new PWRJS("https://pwrrpc.pwrlabs.io/");

    async function sync() {
        let startingBlock = 876040; // Adjust starting block as needed
        const vmId = 123;

        // Defining an asynchronous loop function that fetches and processes new transactions
        const loop = async () => {
            // Fetching the latest block number from the blockchain via the RPC API
            const latestBlock = await rpc.getLatestBlockNumber();
            // Defining the effective block range for the next batch of transactions, limiting to 1000 blocks at a time
            let effectiveLatestBlock = latestBlock > startingBlock + 1000 ? startingBlock + 1000 : latestBlock;

            // Checking if there are new blocks to process
            if (effectiveLatestBlock > startingBlock) {
                // Fetching VM data transactions between the starting block and the effective latest block for a given VM ID
                const txns = await rpc.getVMDataTransactions(startingBlock, effectiveLatestBlock, vmId);
                // Looping through the transactions fetched from the blockchain
                for (let txn of txns) {
                    const sender = txn.sender;
                    const dataHex = txn.data;
                    let nonce = await wallet.getNonce();
                    // Converting the hex data to a buffer and then to a UTF-8 string
                    const data = Buffer.from(dataHex.substring(2), 'hex');
                    const object = JSON.parse(data.toString('utf8'));

                    // Iterating over each key in the object to check for specific conditions
                    Object.keys(object).forEach(async (key) => {
                        if (key.toLowerCase() === "message" && object[key].toLowerCase() === "please send me pwr") {
                            // Building a transfer transaction to send PWR tokens
                            const transferTxn = TransactionBuilder.getTransferPwrTransaction(
                                rpc.getChainId(), nonce, 100, sender
                            );
                            // Adding the transaction to the Transactions class
                            Transactions.add(transferTxn)
                            // Logging the message and the sender to the console
                            console.log(`\nMessage from ${sender}: ${object[key]}`);
                        }
                    });
                }
                // Updating the starting block number for the next loop iteration
                startingBlock = effectiveLatestBlock + 1;
            }
            setTimeout(loop, 1000); // Wait 1 second before the next loop
        }
        loop();
    }
    module.exports = { sync };
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrsdk import PWRPY
    from pwrpy.pwrwallet import PWRWallet
    from pwrpy.TransactionBuilder import TransactionBuilder
    from transaction import Transactions
    from dotenv import load_dotenv
    import json
    import time
    import os
    load_dotenv()

    # Setting up your wallet in the SDK
    private_key = os.getenv("PRIVATE_KEY")
    wallet = PWRWallet(private_key)
    # Setting up the rpc api
    pwr = PWRPY()

    def sync():
        starting_block = 876040 # Adjust starting block as needed
        vm_id = 123

        # Starting an infinite loop to continuously fetch and process transactions
        while True:
            # Fetching the latest block number from the blockchain via the RPC API
            latest_block = pwr.get_latest_block_number()
            # Setting the effective block range to fetch, with a limit of 1000 blocks per iteration
            effective_latest_block = min(latest_block, starting_block + 1000)

            # Checking if there are new blocks to process
            if effective_latest_block >= starting_block:
                # Fetching the latest block number from the blockchain
                txns = pwr.get_vm_data_txns(starting_block, effective_latest_block, vm_id)
                # Looping through the transactions fetched from the blockchain
                for txn in txns:
                    sender = txn.sender
                    data_hex = txn.data
                    # Assuming data_hex is a hex string starting with '0x'
                    data_bytes = bytes.fromhex(data_hex[2:])
                    # Converting the hex data to a buffer and then to a UTF-8 string
                    data_str = data_bytes.decode('utf-8')
                    # Parsing the JSON string into a Python dictionary
                    obj = json.loads(data_str)
                    # Checking if the transaction contains a "message" field with the specified value
                    if 'message' in obj and obj['message'].lower() == "please send me pwr":
                        # Building a transfer transaction to send PWR tokens
                        transfer_txn = TransactionBuilder.get_transfer_pwr_transaction(
                            sender, 100, wallet.get_nonce(), pwr.get_chainId()
                        )
                        # Adding the transfer transaction to the Transactions list for later execution
                        Transactions.add(transfer_txn)
                        # Printing a message to the console showing the sender and the message content
                        print(f"\nMessage from {sender}: {obj['message']}")
                # Updating the starting block number for the next loop iteration
                starting_block = effective_latest_block + 1
            time.sleep(1) # Wait 1 second before the next loop
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::{RPC, Wallet, transaction::NewTransactionData};
    use std::time::Duration;
    use tokio::time::sleep;
    use serde_json::{Value, json};
    use crate::transaction::Transactions;
    use dotenvy::dotenv;
    use std::env;

    pub async fn sync(transactions: &Transactions) {
        dotenv().ok();
        // Setting up your wallet in the SDK
        let private_key = env::var("PRIVATE_KEY").unwrap();
        let wallet = Wallet::from_hex(&private_key).unwrap();
        // Setting up the rpc api
        let rpc = RPC::new("https://pwrrpc.pwrlabs.io/").await.unwrap();
        
        let mut starting_block: u64 = 876040; // Adjust starting block as needed
        let vm_id: u64 = 123;

        // Starting an infinite loop to continuously fetch and process transactions
        loop {
            // Fetch the latest block number without explicit error handling
            let latest_block = rpc.get_latest_block_number().await.unwrap();
            // Defining the effective block range for the next batch of transactions, limiting to 1000 blocks at a time
            let effective_latest_block = if latest_block > starting_block + 1000 {
                starting_block + 1000
            } else {
                latest_block
            };
            // Checking if there are new blocks to process
            if effective_latest_block >= starting_block {
                // Fetching VM data transactions between the starting block and the effective latest block for a given VM ID
                let txns = rpc.get_vm_data_transactions(starting_block, effective_latest_block, vm_id).await.unwrap();
                // Iterating through each transaction
                for txn in txns {
                    let sender = txn.sender;
                    let data = txn.data; // Assuming txn.data is Vec<u8>
                    // Convert data bytes to UTF-8 string without explicit error handling
                    let data_str = String::from_utf8(data).unwrap();
                    // Parse JSON data without explicit error handling
                    let object: Value = serde_json::from_str(&data_str).unwrap();
                    // Converting the parsed JSON object into a map of key-value pairs
                    let obj_map = object.as_object().unwrap();
                    // Iterating through the key-value pairs in the parsed JSON object
                    for (key, value) in obj_map {
                        // Converting the value to a string (assuming it's a string value)
                        let message_str = value.as_str().unwrap();
                        if key.to_lowercase() == "message" && message_str == "please send me pwr" {
                            // Constructing a transfer transaction using the NewTransactionData::Transfer variant
                            let transfer_tx = NewTransactionData::Transfer { 
                                amount: 100, recipient: sender[2..].to_string()
                            }.serialize_for_broadcast(wallet.get_nonce().await, rpc.chain_id, &wallet);
                            // Checking if the transaction was successfully serialized, then adding it to the transactions
                            if let Ok(txn_hex) = transfer_tx.map_err(|e| e.to_string()) {
                                // Convert each transaction (assumed to be a Buffer or Uint8Array) to a hexadecimal string
                                let hex_string = format!("0x{}", txn_hex.iter().map(|byte| format!("{:02x}", byte)).collect::<String>());
                                transactions.add(json!(hex_string));
                            }
                            // Printing the sender and message to the console
                            println!("\nMessage from {}: {}", sender, message_str);
                        }
                    }
                }
                // Updating the starting block number for the next loop iteration
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
        "encoding/hex"
        "encoding/json"
        "fmt"
        "os"
        "log"
        "time"
        "github.com/joho/godotenv"
        "github.com/pwrlabs/pwrgo/rpc"
        "github.com/pwrlabs/pwrgo/wallet"
        "github.com/pwrlabs/pwrgo/encode"
    )

    func Sync() {
        // Setting up your wallet in the SDK
        godotenv.Load()
        privateKey := os.Getenv("PRIVATE_KEY")
        wallet := wallet.FromPrivateKey(privateKey)

        startingBlock := 876040 // Adjust starting block as needed
        vmId := 123

        // Defining an asynchronous loop function that fetches and processes new transactions
        go func() {
            for {
                // Fetching the latest block number from the blockchain via the RPC API
                latestBlock := rpc.GetLatestBlockNumber()
                // Defining the effective block range for the next batch of transactions, limiting to 1000 blocks at a time
                effectiveLatestBlock := latestBlock
                if latestBlock > startingBlock+1000 {
                    effectiveLatestBlock = startingBlock + 1000
                }

                // Checking if there are new blocks to process
                if effectiveLatestBlock > startingBlock {
                    // Fetching VM data transactions between the starting block and the effective latest block for a given VM ID
                    txns := rpc.GetVmDataTransactions(startingBlock, effectiveLatestBlock, vmId)
                    // Looping through the transactions fetched from the blockchain
                    for _, txn := range txns {
                        sender := txn.Sender
                        dataHex := txn.Data
                        nonce := wallet.GetNonce()

                        // Converting the hex data to a buffer and then to a UTF-8 string
                        dataBytes, _ := hex.DecodeString(dataHex[2:])
                        var obj map[string]interface{}
                        if err := json.Unmarshal(dataBytes, &obj); err != nil {
                            log.Println("Error parsing JSON:", err)
                            continue
                        }

                        // Iterating over each key in the object to check for specific conditions
                        if message, ok := obj["message"].(string); ok && message == "please send me pwr" {
                            var buffer []byte
                            // Building a transfer transaction to send PWR tokens
                            buffer, err := encode.TransferTxBytes(100, sender, nonce)
                            if err != nil {
                                log.Println("Error encoding transaction:", err)
                                continue
                            }
                            // Adding the transaction to the Transactions struct
                            PendingTransactions.Add(buffer)
                            // Logging the message and the sender to the console
                            fmt.Printf("\nMessage from %s: %s\n", sender, message)
                        }
                    }
                    // Updating the starting block number for the next loop iteration
                    startingBlock = effectiveLatestBlock + 1
                }
                time.Sleep(1 * time.Second) // Wait 1 second before the next loop
            }
        }()
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
</Tabs>

## Step 6: Create Your Conduits Transactions API

Conduit nodes run instances of the virtual machine on their servers and make repetitive API calls to check if the application has any new transactions it wants submitted to the PWR Chain.

Create a `app` file in your project and add the following code:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const express = require("express");
    const { Transactions } = require("./transaction.js");
    const { sync } = require("./sync_messages.js");

    // Initialize the Express application by creating an app object
    const app = express();

    // Add sync to fetch messages and add it to the pending txs
    sync();

    // Define an HTTP GET route at '/pendingVmTransactions'
    // When accessed, this route will return the list of pending transactions
    app.get('/pendingVmTransactions', (req, res) => {
        // Set the response header to ensure the response is sent as JSON data
        res.header("Content-Type", "application/json");
        // Retrieve the list of pending transactions using the getPendingTransactions method
        const pendingTransactions = Transactions.getPendingTransactions();
        // Map through each transaction in the pendingTransactions array
        const array = pendingTransactions.map(txn => {
            // Convert each transaction (assumed to be a Buffer or Uint8Array) to a hexadecimal string
            const hexString = '0x' + Array.from(txn, byte => byte.toString(16).padStart(2, '0')).join(''); // Convert Buffer to hex string
            // Remove the transaction from the pending transactions list after processing
            Transactions.remove(txn);
            // Return the hexadecimal representation of the transaction
            return hexString;
        });
        // Send the resulting array of hex strings as a JSON response
        res.json(array);
    })
    // Set the port number for the server to listen on
    const port = 8000;
    // Start the Express server and listen for connections on the specified port
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from flask import Flask, jsonify
    from transaction import Transactions
    from conduit import sync
    import threading

    app = Flask(__name__)

    # Add sync to fetch messages and add it to the pending txs
    threading.Thread(target=sync, daemon=True).start()

    # Define an HTTP GET route at '/pendingVmTransactions'
    # When accessed, this route will return the list of pending transactions
    @app.route('/pendingVmTransactions/', methods=['GET'])
    def pending_vm_transactions():
        # Retrieve the list of pending transactions using the getPendingTransactions method
        pending_transactions = Transactions.get_pending_transactions()

        array = []
        # Map through each transaction in the pendingTransactions array
        for txn in pending_transactions:
            # Convert each transaction (assumed to be a Buffer or Uint8Array) to a hexadecimal string
            hex_string = '0x' + ''.join(format(byte, '02x') for byte in txn)
            # Return the hexadecimal representation of the transaction
            Transactions.remove(txn)
            array.append(hex_string)
        # Send the resulting array of hex strings as a JSON response
        return jsonify(array), 200

    # Set the port number for the server to listen on
    # Start the Flask server and listen for connections on the specified port
    if __name__ == '__main__':
        port = 8000
        app.run(host='0.0.0.0', port=port, debug=False)
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    pub mod transaction;
    pub mod sync_messages;
    use transaction::Transactions;
    use sync_messages::sync;
    use warp::Filter;
    use tokio;
    use std::sync::Arc;

    #[tokio::main]
    pub async fn main() {
        let txs = Arc::new(Transactions::new());

        // Add sync to fetch messages and add it to the pending txs
        tokio::spawn({
            let txs = txs.clone();
            async move {
                sync(&txs).await;
            }
        });

        // Define an HTTP GET route at '/pendingVmTransactions'
        // When accessed, this route will return the list of pending transactions
        let user_route = warp::path("pendingVmTransactions")
            .map(move || {
                // Retrieve the list of pending transactions using the getPendingTransactions method
                let tx = txs.get_pending_transactions();
                // Map through each transaction in the pendingTransactions array
                for txn in tx.clone() {
                    // Return the hexadecimal representation of the transaction
                    txs.remove(&txn);
                }
                // Send the resulting array of hex strings as a JSON response
                warp::reply::json(&tx)
            });
        
        // Set the port number for the server to listen on
        // Start the Warp server and listen for connections on the specified port
        warp::serve(user_route)
            .run(([127, 0, 0, 1], 8000)) // Bind to localhost:8000
            .await;
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "fmt"
        "log"
        "encoding/hex"
        "encoding/json"
        "net/http"
    )

    func App() {
        // Add sync to fetch messages and add it to the pending txs
        go Sync()

        // Define an HTTP GET route at '/pendingVmTransactions'
        // When accessed, this route will return the list of pending transactions
        http.HandleFunc("/pendingVmTransactions", func(w http.ResponseWriter, r *http.Request) {
            // Set the response header to ensure the response is sent as JSON data
            w.Header().Set("Content-Type", "application/json")
            // Retrieve the list of pending transactions using the getPendingTransactions method
            pending := PendingTransactions.GetPendingTransactions()

            var hexStrings []string
            // Map through each transaction in the pendingTransactions array
            for _, txn := range pending {
                // Convert each transaction (assumed to be a Buffer or Uint8Array) to a hexadecimal string
                hexString := "0x" + hex.EncodeToString(txn)
                hexStrings = append(hexStrings, hexString)
                // Remove the transaction from the pending transactions list after processing
                PendingTransactions.Remove(txn)
            }

            // Send the resulting array of hex strings as a JSON response
            if err := json.NewEncoder(w).Encode(hexStrings); err != nil {
                http.Error(w, "Failed to encode JSON response", http.StatusInternalServerError)
                return
            }
        })

        // Set the port number for the server to listen on
        port := ":8000"
        fmt.Printf("Server running on http://localhost%s\n", port)
        // Start the HTTP server and listen for connections on the specified port
        if err := http.ListenAndServe(port, nil); err != nil {
            log.Fatalf("Failed to start server: %v", err)
        }
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
</Tabs>

Conduit nodes will call the `/pendingVmTransactions` endpoint and retrieve the application's transactions as hex strings in a JSON array.

**Example API request:**:

```bash
curl -X GET http://localhost:8000/pendingVmTransactions/ -H "Content-Type: application/json"
```

**Example API response:**:

```js
[
  "0x1234567890abcdef...",
  "0x0987654321fedcba..."
]
```

In the code above, we remove the transactions once they have been retrieved by the conduit node, but depending on your application's needs and error handling, you might want to implement a different approach to transaction handling, such as marking transactions as processed or implementing a retry mechanism.

## Step 7: Set Conduit Nodes

To set the conduit nodes for your application, use the `Set Conduits` method provided by the PWR SDK.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    import { PWRWallet } from "@pwrjs/core";
    import dotenv from 'dotenv';
    dotenv.config();

    // Setting up your wallet in the SDK
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new PWRWallet(privateKey);

    async function conduits() {
        const conduits = [
            Buffer.from("conduit_node_address", "hex"),
        ];
        const vmId = "your_vm_id";

        const res = await wallet.setConduits(vmId, conduits);
        console.log(res.transactionHash);
    }
    conduits();
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrwallet import PWRWallet
    from dotenv import load_dotenv
    import os
    load_dotenv()

    # Setting up your wallet in the SDK
    private_key = os.getenv("PRIVATE_KEY")
    wallet = PWRWallet(private_key)

    def conduits():
        conduits = [
            bytes.fromhex("conduit_node_address"),
        ]
        vm_id = "your_vm_id"

        res = wallet.set_conduits(vm_id, conduits)
        print(res.data)

    conduits()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::Wallet;
    use dotenvy::dotenv;
    use std::env;

    async fn conduits() {
        dotenv().ok();
        // Setting up your wallet in the SDK
        let private_key = env::var("PRIVATE_KEY").unwrap();
        let wallet = Wallet::from_hex(&private_key).unwrap();

        let conduits: Vec<String> = vec![
            "conduit_node_address".to_string(),
        ];
        let vm_id: u64 = "your_vm_id";

        let res = wallet.set_conduits(vm_id, conduits).await;
        println!("{}", res);
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "fmt"
        "os"
        "github.com/joho/godotenv"
        "github.com/pwrlabs/pwrgo/wallet"
    )

    func SetConduits() {
        // Setting up your wallet in the SDK
        godotenv.Load()
        privateKey := os.Getenv("PRIVATE_KEY")
        wallet := wallet.FromPrivateKey(privateKey)

        vmIds := "your_vm_id"
        conduits := []string{"conduit_node_address"}

        tx := wallet.SetConduits(vmIds, conduits)

        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
</Tabs>

Replace `your_vm_id` with the claimed VM ID from Step 1 and provide the addresses of the conduit nodes you have agreed with.

When selecting conduit nodes, consider the following factors:

- **Reliability**: Choose conduit nodes that have a proven track record of uptime and reliability. They should be able to consistently process transactions and maintain synchronization with the PWR Chain.
- **Security**: Ensure that the conduit nodes follow best practices for security, such as using secure communication channels, implementing access controls, and regularly updating their software and infrastructure.
- **Incentives**: Agree on a fair decentralized incentive model with the conduit nodes to motivate them to run your application and process transactions efficiently. This can include rewards, revenue sharing, or other benefits.

After the transaction is confirmed, the specified conduit nodes will be set for your application. These conduit nodes will now be responsible for translating your application's transaction requests into actual transactions on the PWR Chain.

Once you have established conduit nodes, you cannot remove or modify them without their consent. Therefore, it is advisable to integrate the rules for adding and approving conduit nodes directly into your application. By doing so, the conduit nodes will automatically enforce these rules.

## Step 8: Distribute Your Application To The Conduit Nodes

Once all the above steps are accomplished, you can share your application with the conduit nodes, and they will become its validators and message relayers. It's important to share the same application with all conduits to ensure a unified set of rules across them all.

When distributing your application to conduit nodes, consider the following best practices:

Versioning: Use a clear versioning scheme for your application releases. This helps conduit nodes understand which version they are running and makes it easier to manage updates and bug fixes.

Update Mechanism: Establish a clear mechanism for updating your application when new versions are released. This can include automated update scripts or notifications to conduit nodes about new releases.
