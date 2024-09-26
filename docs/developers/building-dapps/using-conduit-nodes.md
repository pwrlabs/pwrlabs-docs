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
- You've finished reading about [**Conduits** Nodes](/pwrchain/architecture-of-pwr-chain/nodes-and-their-roles/conduits-nodes/about).
- You have finished reading the [**SDK** guides](/developers/sdks/installing-and-importing-pwr-sdk).

## Step 1: Set Up the Project

Create a new project in your preferred programming language, and add the necessary dependencies, including the PWR SDK, to your project's configuration file or build tool.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```bash
    mkdir conduits && cd conduits
    npm init --yes
    npm install @pwrjs/core dotenv readline
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```bash
    mkdir conduits && cd conduits
    python3 -m venv venv
    source venv/bin/activate
    pip3 install pwrpy python-dotenv
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```bash
    cargo new conduits && cd conduits
    cargo add pwr-rs dotenvy serde_json
    cargo add tokio@1.0 --features full
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    ```
</TabItem>
</Tabs>

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
    import { PWRWallet } from "@pwrjs/core";
    import dotenv from 'dotenv';
    dotenv.config();

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

    async fn send_message() {
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
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    ```
</TabItem>
</Tabs>

## Step 4: Transactions Awaiting Approval

The `Transactions` class manages the list of transactions awaiting approval:

Once the data is fetched from PWR Chain the transactions associated with sending 100 pwr to the user will be stored in the transactionsAwaitingApproval array.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    export class Transactions {
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
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    ```
</TabItem>
</Tabs>

## Step 5: Fetch Messages

To fetch messages from the PWR Chain, we'll use the method provided by the PWR SDK to retrieve transactions within a range of blocks.

Create a `sync_messages` file in your project and add the following code:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    import { PWRJS, PWRWallet, TransactionBuilder } from "@pwrjs/core";
    import { Transactions } from "./transaction.js"
    import dotenv from 'dotenv';
    dotenv.config();

    // Setting up your wallet in the SDK
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new PWRWallet(privateKey);
    // Setting up the rpc api
    const rpc = new PWRJS("https://pwrrpc.pwrlabs.io/");

    export async function sync() {
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
    use crate::conduits::transaction::Transactions;
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
            let latest_block = rpc.lates_block_number().await.unwrap();
            // Defining the effective block range for the next batch of transactions, limiting to 1000 blocks at a time
            let effective_latest_block = if latest_block > starting_block + 1000 {
                starting_block + 1000
            } else {
                latest_block
            };
            // Checking if there are new blocks to process
            if effective_latest_block >= starting_block {
                // Fetching VM data transactions between the starting block and the effective latest block for a given VM ID
                let txns = rpc.vm_data_transactions(starting_block, effective_latest_block, vm_id).await.unwrap();
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
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    ```
</TabItem>
</Tabs>

## Step 6: Create Your Conduits Transactions API

Conduit nodes run instances of the virtual machine on their servers and make repetitive API calls to check if the application has any new transactions it wants submitted to the PWR Chain.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    import express from "express";
    import { Transactions } from "./transaction.js"
    import { sync } from "./conduit.js"

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
            // Array.from(txn) creates an array from the buffer, then each byte is converted to a hexadecimal string
            // byte.toString(16) converts the byte to hex, and padStart(2, '0') ensures 2 characters per byte
            // The hexadecimal string is then prefixed with '0x' and joined together
            const hexString = '0x' + Array.from(txn, byte => byte.toString(16).padStart(2, '0')).join(''); // Convert Buffer to hex string
            // Remove the transaction from the pending transactions list after processing
            Transactions.remove(txn); // Assuming remove expects the exact Buffer object
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
    })
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
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
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
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
