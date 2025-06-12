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
- You have finished reading the [**SDK** guides](/developers/sdks/overview).

## Step 1: Set Up the Project

Create a new project in your preferred programming language, and add the necessary dependencies, including the PWR SDK, to your project's configuration file or build tool.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```bash
    mkdir conduits && cd conduits
    npm init --yes
    npm install @pwrjs/core @noble/hashes express dotenv readline
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```bash
    mkdir conduits && cd conduits
    python3 -m venv venv
    source venv/bin/activate
    pip3 install pwrpy python-dotenv flask
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

Create a `.env` file in your project folder and add your wallet's **`SEED_PHRASE`** in the file.

```bash
SEED_PHRASE="ADD_YOUR_SEED_PHRASE_HERE"
```

## Step 3: Send Messages

To send a message, we'll use the method provided by the PWR SDK to send a transaction with the message data.

Create a `send_message` file in your project and add the following code:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const Wallet = require("@pwrjs/core/wallet");
    require('dotenv').config();

   const seedPhrase = process.env.SEED_PHRASE;
    let wallet = Wallet.fromSeedPhrase(seedPhrase);

    async function sendMessage() {
        const obj = { message: "please send me pwr" };
        const data = Buffer.from(JSON.stringify(obj), 'utf8'); // Serialize to JSON bytes
        const vidaId = BigInt(123);

        // Sending the VIDA data transaction
        const res = await wallet.sendVidaData(vidaId, data);
        if (res.success) {
            console.log(`Transaction hash: ${res.hash}`);
        } else {
            console.log(`Transaction failed: ${res.message}`);
        }
    }
    sendMessage();
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrwallet import Wallet
    from dotenv import load_dotenv
    import json
    import os
    load_dotenv()

    # Setting up your wallet in the SDK
    seed_phrase = os.getenv("SEED_PHRASE")
    wallet = Wallet.new(seed_phrase)

    def send_message():
        vida_id = 123
        obj = {"message": "please send me pwr"}
        data = json.dumps(obj).encode('utf-8') # Serialize to JSON bytes
        fee_per_byte = wallet.get_rpc().get_fee_per_byte()

        # Sending the VIDA data transaction
        res = wallet.send_vida_data(vida_id, data, fee_per_byte)
        if res.success:
            print(f"Transaction hash: 0x{res.hash.hex()}")
        else:
            print(f"Transaction failed: {res.error}")
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
        let seed_phrase = env::var("SEED_PHRASE").unwrap();
        let wallet = Wallet::new(&seed_phrase);

        let vida_id = 123;
        let obj = json!({ "message": "please send me pwr" });
        let data = serde_json::to_vec(&obj).unwrap(); // Serialize to JSON bytes
        let fee_per_byte = (wallet.get_rpc().await).get_fee_per_byte().await.unwrap();

        // Sending the VIDA data transaction
        let res = wallet.send_vida_data(vida_id, data, fee_per_byte).await;
        if res.success {
            println!("Transaction hash: {:?}", res.data.unwrap());
        } else {
            println!("Transaction failed: {:?}", res.error);
        }
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
        seedPhrase := os.Getenv("SEED_PHRASE")
        wallet := wallet.New(seedPhrase)

        vidaId := 123
        data, _ := json.Marshal(map[string]string{"message": "please send me pwr"})
        feePerByte := wallet.GetRpc().GetFeePerByte()

        // Sending the VIDA data transaction
        tx := wallet.SendVidaData(vidaId, data, feePerByte)

        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.Hash)
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

Once the data is fetched from PWR Chain the transactions associated with sending 1 pwr to the user will be stored in the transactionsAwaitingApproval array.

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
    use lazy_static::lazy_static;

    lazy_static! {
        static ref TRANSACTIONS: Arc<Mutex<Vec<Value>>> = Arc::new(Mutex::new(Vec::new()));
    }

    pub struct Transactions;

    impl Transactions {
        pub fn new() -> Self {
            Transactions
        }

        pub fn add(txn: Value) {
            let mut txns = TRANSACTIONS.lock().unwrap();
            txns.push(txn);
        }

        pub fn remove(txn: &Value) {
            let mut txns = TRANSACTIONS.lock().unwrap();
            *txns = txns.iter()
                .filter(|&tx| tx != txn)
                .cloned()
                .collect();
        }

        pub fn get_pending_transactions() -> Vec<Value> {
            let txns = TRANSACTIONS.lock().unwrap();
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
    const PWRJS = require("@pwrjs/core");
    const Wallet = require("@pwrjs/core/wallet");
    const { TransactionBuilder } = require("@pwrjs/core/utils");
    const { Transactions } = require("./transaction.js");
    const { hexToBytes } = require("@noble/hashes/utils");
    require('dotenv').config();

    const seedPhrase = process.env.SEED_PHRASE;
    const wallet = Wallet.fromSeedPhrase(seedPhrase);
    const rpc = new PWRJS("https://pwrrpc.pwrlabs.io/");
    const chainId = 0;

    async function handlerMessages(transaction) {
        const sender = transaction.sender;
        const dataHex = transaction.data;
        const feePerByte = BigInt(await rpc.getFeePerByte());

        // Converting the hex data to a buffer and then to a UTF-8 string
        const data = Buffer.from(dataHex, 'hex');
        const object = JSON.parse(data.toString('utf8'));

        // Iterating over each key in the object to check for specific conditions
        Object.keys(object).forEach(async (key) => {
            if (key.toLowerCase() === "message" && object[key].toLowerCase() === "please send me pwr") {
                const nonce = await wallet.getNonce();
                const walletAddress = hexToBytes(wallet.getAddress().substring(2));
                const senderAddress = hexToBytes(sender);
                // Building a transfer transaction to send PWR tokens
                const transferTxn = TransactionBuilder.getTransferTransaction(
                    feePerByte, walletAddress, senderAddress, BigInt(1000000000), nonce, chainId
                );
                // Adding the transaction to the Transactions class
                Transactions.add(transferTxn)
                // Logging the message and the sender to the console
                console.log(`\nMessage from 0x${sender}: ${object[key]}`);
            }
        });
    }

    async function sync() {
        const startingBlock = BigInt(await rpc.getLatestBlockNumber());
        const vidaId = BigInt(123);

        rpc.subscribeToVidaTransactions(vidaId, startingBlock, handlerMessages);
    }
    module.exports = { sync };
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrsdk import PWRPY
    from pwrpy.pwrwallet import Wallet
    from pwrpy.models.Transaction import VidaDataTransaction
    from pwrpy.TransactionBuilder import TransactionBuilder
    from transaction import Transactions
    from dotenv import load_dotenv
    import json
    import time
    import os
    load_dotenv()

    # Setting up your wallet in the SDK
    seed_phrase = os.getenv("SEED_PHRASE")
    wallet = Wallet.new(seed_phrase)
    # Setting up the rpc api
    rpc = PWRPY("https://pwrrpc.pwrlabs.io/")

    def handler_messages(txn: VidaDataTransaction):
        try:
            sender = txn.sender
            data_hex = txn.data
            # Assuming data_hex is a hex string starting with '0x'
            data_bytes = bytes.fromhex(data_hex)
            # Converting the hex data to a buffer and then to a UTF-8 string
            data_str = data_bytes.decode('utf-8')
            # Parsing the JSON string into a Python dictionary
            obj = json.loads(data_str)
            # Checking if the transaction contains a "message" field with the specified value
            if 'message' in obj and obj['message'].lower() == "please send me pwr":
                fee_per_byte = rpc.get_fee_per_byte()
                # Building a transfer transaction to send PWR tokens
                transfer_txn = TransactionBuilder.get_transfer_pwr_transaction(
                    sender, 1000000000, wallet.get_nonce(), rpc.get_chainId(), wallet.get_address(), fee_per_byte
                )
                # Adding the transfer transaction to the Transactions list for later execution
                Transactions.add(transfer_txn)
                # Printing a message to the console showing the sender and the message content
                print(f"\nMessage from 0x{sender}: {obj['message']}")
        except Exception as e:
            print('Error in sync:', e)
            time.sleep(1)

    def sync():
        starting_block = rpc.get_latest_block_number()
        vida_id = 123
        rpc.subscribe_to_vida_transactions(vida_id, starting_block, handler=handler_messages)
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::{RPC, Wallet, transaction::{NewTransactionData, VidaDataTransaction}};
    use serde_json::{Value, json};
    use crate::transaction::Transactions;
    use dotenvy::dotenv;
    use std::env;
    use std::sync::Arc;

    const FEE_PER_BYTE: u64 = 1000;
    const CHAIN_ID: u8 = 0;

    fn handler_messages(txn: VidaDataTransaction) {
        dotenv().ok();
        // Setting up your wallet in the SDK
        let seed_phrase = env::var("SEED_PHRASE").unwrap();
        let wallet = Wallet::new(&seed_phrase);

        // Spawn a new async task to handle the async operations
        tokio::spawn(async move {
            let sender = txn.sender;
            let data = txn.data;
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
                        amount: 1000000000, receiver: sender[2..].to_string()
                    }.serialize_for_broadcast(wallet.get_nonce().await, CHAIN_ID, FEE_PER_BYTE, &wallet);
                    // Checking if the transaction was successfully serialized, then adding it to the transactions
                    if let Ok(txn_hex) = transfer_tx.map_err(|e| e.to_string()) {
                        // Convert each transaction (assumed to be a Buffer or Uint8Array) to a hexadecimal string
                        let hex_string = format!("0x{}", txn_hex.iter().map(|byte| format!("{:02x}", byte)).collect::<String>());
                        Transactions::add(json!(hex_string));
                    }
                    // Printing the sender and message to the console
                    println!("\nMessage from 0x{}: {}", sender, message_str);
                }
            }
        });
    }

    pub async fn sync() {
        // Setting up the rpc api
        let rpc = RPC::new("https://pwrrpc.pwrlabs.io/").await.unwrap();
        let rpc = Arc::new(rpc);

        let starting_block: u64 = rpc.get_latest_block_number().await.unwrap();
        let vida_id: u64 = 123;

        rpc.subscribe_to_vida_transactions(vida_id, starting_block, handler_messages);
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
        "github.com/joho/godotenv"
        "github.com/pwrlabs/pwrgo/rpc"
        "github.com/pwrlabs/pwrgo/wallet"
        "github.com/pwrlabs/pwrgo/encode"
    )

    func handlerMessages(transaction rpc.VidaDataTransaction) {
        godotenv.Load()
        seedPhrase := os.Getenv("SEED_PHRASE")
        wallet, err := wallet.New(seedPhrase)
        if err != nil {
            fmt.Println("Error getting the wallet:", err)
            return
        }

        sender := transaction.Sender
        dataHex := transaction.Data
        nonce := wallet.GetNonce()

        // Converting the hex data to a buffer and then to a UTF-8 string
        dataBytes, _ := hex.DecodeString(dataHex)
        var obj map[string]interface{}
        if err := json.Unmarshal(dataBytes, &obj); err != nil {
            fmt.Println("Error parsing JSON:", err)
        }

        // Iterating over each key in the object to check for specific conditions
        if message, ok := obj["message"].(string); ok && message == "please send me pwr" {
            var buffer []byte
            // Building a transfer transaction to send PWR tokens
            buffer, err := encode.TransferTxBytes(1000000000, sender, nonce, wallet.Address, wallet.GetRpc().GetFeePerByte())
            if err != nil {
                fmt.Println("Error encoding transaction:", err)
            }
            // Adding the transaction to the Transactions struct
            PendingTransactions.Add(buffer)
            // Logging the message and the sender to the console
            fmt.Printf("\nMessage from 0x%s: %s\n", sender, message)
        }
    }

    func Sync() {
        rpc := rpc.SetRpcNodeUrl("https://pwrrpc.pwrlabs.io")
        startingBlock := rpc.GetLatestBlockNumber()
        vidaId := 123

        rpc.SubscribeToVidaTransactions(vidaId, startingBlock, handlerMessages)
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

    // Define an HTTP GET route at '/pending-vida-transactions'
    // When accessed, this route will return the list of pending transactions
    app.get('/pending-vida-transactions', (req, res) => {
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
    from sync_messages import sync
    import threading

    app = Flask(__name__)

    # Add sync to fetch messages and add it to the pending txs
    threading.Thread(target=sync, daemon=True).start()

    # Define an HTTP GET route at '/pending-vida-transactions'
    # When accessed, this route will return the list of pending transactions
    @app.route('/pending-vida-transactions', methods=['GET'])
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

    #[tokio::main]
    pub async fn main() {
        // Add sync to fetch messages and add it to the pending txs
        tokio::spawn(async move {
            sync().await;
        });

        // Define an HTTP GET route at '/pending-vida-transactions'
        // When accessed, this route will return the list of pending transactions
        let user_route = warp::path("pending-vida-transactions")
            .map(move || {
                // Retrieve the list of pending transactions using the getPendingTransactions method
                let tx = Transactions::get_pending_transactions();
                // Map through each transaction in the pendingTransactions array
                for txn in tx.clone() {
                    // Return the hexadecimal representation of the transaction
                    Transactions::remove(&txn);
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

    func main() {
        // Add sync to fetch messages and add it to the pending txs
        go Sync()

        // Define an HTTP GET route at '/pending-vida-transaction'
        // When accessed, this route will return the list of pending transactions
        http.HandleFunc("/pending-vida-transactions", func(w http.ResponseWriter, r *http.Request) {
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

Conduit nodes will call the `/pending-vida-transactions` endpoint and retrieve the application's transactions as hex strings in a JSON array.

**Example API request:**:

```bash
curl -X GET http://localhost:8000/pending-vida-transactions -H "Content-Type: application/json"
```

**Example API response:**:

```json
[
  "0x1234567890abcdef...",
  "0x0987654321fedcba..."
]
```

In the code above, we remove the transactions once they have been retrieved by the conduit node, but depending on your application's needs and error handling, you might want to implement a different approach to transaction handling, such as marking transactions as processed or implementing a retry mechanism.

## Step 7: Set Conduit Nodes

To set the conduit nodes for your application, use the `Set Conduits` method provided by the PWR SDK.

> [!NOTE] WE ARE STILL UPDATING THE DOCS TO INCLUDE MORE EXAMPLES FOR THE SDKs.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const Wallet = require("@pwrjs/core/wallet");
    require('dotenv').config();

    // Setting up your wallet in the SDK
    const seedPhrase = process.env.SEED_PHRASE;
    const wallet = Wallet.fromSeedPhrase(seedPhrase);

    async function conduits() {
        
    }
    conduits();
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrwallet import Wallet
    from dotenv import load_dotenv
    import os
    load_dotenv()

    # Setting up your wallet in the SDK
    seed_phrase = os.getenv("SEED_PHRASE")
    wallet = Wallet.new(seed_phrase)

    def conduits():
        pass

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
        let seed_phrase = env::var("SEED_PHRASE").unwrap();
        let wallet = Wallet::new(&seed_phrase);
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
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
</Tabs>

Replace `your_vida_id` with the claimed VIDA ID from Step 1 and provide the addresses of the conduit nodes you have agreed with.

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
