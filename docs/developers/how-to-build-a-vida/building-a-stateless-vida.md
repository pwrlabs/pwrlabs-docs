---
title: Building a Stateless VIDA
sidebar_position: 3
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Building a Stateless VIDA

Stateless VIDAs are lightweight, fast, and simple applications that do not require validating or maintaining historical data or consistent state across its execution instances. They are ideal for non-critical use cases such as chat rooms, simple games, or other applications where speed and ease of development are prioritized over strict consistency.

## Steps to Build a Stateless VIDA

### 1. **Select an ID for Your VIDA**

Every VIDA requires a unique identifier, which is an 8-byte variable. This ID ensures the PWR Chain knows which transactions belong to your application.

> **Why 8 bytes?** It minimizes storage requirements while allowing for 18 quintillion unique IDs.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const crypto = require('crypto');

    // Generate a random 64-bit integer
    const vidaId = BigInt('0x' + crypto.randomBytes(8).toString('hex'));

    console.log(vidaId.toString());
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    # Generate a random 64-bit signed integer
    vida_id = secrets.randbits(64) - (1 << 63)

    print(vida_id)
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use rand::Rng;

    fn main() {
        let mut rng = rand::thread_rng();
        let veda_id: i64 = rng.gen();
        
        println!("{}", veda_id);
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "crypto/rand"
        "encoding/binary"
        "fmt"
    )

    func main() {
        var vedaId int64
        err := binary.Read(rand.Reader, binary.LittleEndian, &vedaId)
        if err != nil {
            fmt.Println("Error generating random number:", err)
            return
        }

        fmt.Println(vedaId)
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using System.Security.Cryptography;

    byte[] buffer = new byte[8];

    // Generate a random 64-bit signed integer
    using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
    {
        rng.GetBytes(buffer);
    }

    ulong vedaId = BitConverter.ToUInt64(buffer, 0);
    Console.WriteLine(vedaId);
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    //generate a random long value
    long vedaId = new SecureRandom().nextLong();
    System.out.println(vidaId);
            
    //Save the vidaId
    ```
</TabItem>
</Tabs>

### 2. **Import the PWR SDK**

The PWR SDK is your toolkit for interacting with the PWR Chain. It allows you to create wallets, send transactions, and read data from the blockchain.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    import { PWRJS, PWRWallet } from '@pwrjs/core';
    // or
    const { PWRJS, PWRWallet } = require('@pwrjs/core');
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrapisdk import PWRPY
    from pwrpy.pwrwallet import Wallet
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::{ Wallet, RPC };
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    import (
        "github.com/pwrlabs/pwrgo/wallet"
        "github.com/pwrlabs/pwrgo/rpc"
    )
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;
    using PWR.Models;
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    <repositories>
        <repository>
            <id>jitpack.io</id>
            <url>https://jitpack.io</url>
        </repository>
    </repositories>

    <dependencies>
        <dependency>
            <groupId>com.github.pwrlabs</groupId>
            <artifactId>pwrj</artifactId>
            <version>8.7.0</version>
        </dependency>
    </dependencies>
    ```
</TabItem>
</Tabs>

### 3. **Initializing PWR with an RPC Endpoint**

To interact with the PWR Chain, initialize a PWR object (e.g., PWRJ for Java, PWRPY for Python). This object serves as your gateway to the blockchain.

**What is an RPC Node?**

An RPC (Remote Procedure Call) node processes blockchain requests, such as transactions and data queries. You can use a public node (e.g., https://pwrrpc.pwrlabs.io) or run your own for better control and security.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const pwrjs = new PWRJS("https://pwrrpc.pwrlabs.io/");
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    pwrpy= PWRPY("https://pwrrpc.pwrlabs.io/")
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    let pwrrs = RPC::new("https://pwrrpc.pwrlabs.io/").await.unwrap();
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    var pwr = new RPC("https://pwrrpc.pwrlabs.io/");
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    PWRJ pwrj = new PWRJ("https://pwrrpc.pwrlabs.io");
    ```
</TabItem>
</Tabs>

This setup enables seamless interaction with the PWR Chain for your VIDA.

### 4. **Create and Fund a Wallet**

A wallet is essential for signing transactions and paying minimal fees on the PWR Chain.

1. Create a new wallet or load an existing one.
2. Save the wallet securely in an encrypted file.
3. Fund it using the [PWR Chain faucet](http://faucet.pwrlabs.io/) (for test coins). You can check your PWR coins balance on the [PWR Chain Explorer](https://explorer.pwrlabs.io/) by putting your address in the search bar.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRWallet, PWRJS} = require('@pwrjs/core');

    const pwrjs = new PWRJS("https://pwrrpc.pwrlabs.io/");

    // generate and save wallet
    const wallet = new PWRWallet();
    console.log("Address: " + wallet.getAddress());
    wallet.storeWallet("my_wallet.dat", "password");

    //load wallet
    const wallet = PWRWallet.loadWallet("my_wallet.dat", "password", pwrjs);
    console.log("Address: " + wallet.getAddress());
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrwallet import Wallet

    # generate and save a new wallet
    wallet = Wallet.new_random(12)
    print(f"Address: {wallet.get_address()}")
    wallet.store_wallet("my_wallet.dat", "password")

    # load wallet
    wallet = Wallet.load_wallet("my_wallet.dat", "password")
    print(f"Address: {wallet.get_address()}")
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::Wallet;

    fn main() {
        // generate and save wallet
        let wallet = Wallet::new_random(12);
        println!("Address: {:?}", wallet.get_address());
        wallet.store_wallet("my_wallet.dat", "password")
            .expect("Failed to store wallet");

        // load wallet
        let wallet = Wallet::load_wallet("my_wallet.dat", "password")
            .expect("Failed to load wallet");
        println!("Address: {:?}", wallet.get_address());
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    import (
        "fmt"
        "github.com/pwrlabs/pwrgo/wallet"
    )

    func main() {
        // generate and save wallet
        var new_wallet = wallet.NewRandom(12)
        fmt.Printf("Address: %s\n", new_wallet.GetAddress())
        new_wallet.StoreWallet("my_wallet.dat", "password")

        // load wallet
        var wallet, _ = wallet.LoadWallet("my_wallet.dat", "password")
        fmt.Printf("Address: %s\n", wallet.GetAddress())
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;
    using PWR.Models;
    using System.Text.Json;

    class Program
    {
        static async Task Main()
        {
            // generate and save wallet
            var new_wallet = new Wallet(12);
            Console.WriteLine($"Address: {new_wallet.GetAddress()}");
            new_wallet.StoreWallet("my_wallet.dat", "password");

            var wallet = Wallet.LoadWallet("my_wallet.dat", "password");
            Console.WriteLine($"Address: {wallet.GetAddress()}");
        }
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    import com.github.pwrlabs.pwrj.protocol.PWRJ;
    import com.github.pwrlabs.pwrj.wallet.PWRWallet;

    PWRJ pwrj = new PWRJ("https://pwrrpc.pwrlabs.io/");

    //generate and save wallet
    PWRWallet wallet = new PWRWallet(pwrj);
    System.out.println("Address: " + wallet.getAddress());
    wallet.storeWallet("my_wallet.dat", "password");

    //load wallet
    PWRWallet wallet = PWRWallet.loadWallet("my_wallet.dat", "password", pwrj);
    System.out.println("Address: " + wallet.getAddress());
    ```
</TabItem>
</Tabs>

### 5. **Define Transaction Data Structure**

While PWR Chain stores all transaction data as raw byte arrays, VIDAs can encode this data into structured formats like JSON. Defining a **schema for your transactions** ensures consistency, simplifies development, and enables collaboration across teams.

**Why Define a Schema?**

- **Consistency**: Ensures all transactions follow a predictable format.
- **Documentation**: Serves as a reference for developers interacting with your VIDA.
- **Validation**: Helps catch malformed data early.

**Example:**

```json
[
    {
        "action": "send-message-v1",
        "message": "Hello World!"
    },
    
    {
        "action": "add-reaction-v1",
        "message-hash": "0x54ef...",
        "reaction": "thumbs-up"
    }
]
```

### 6. **Send Data to PWR Chain**

After defining your transaction's data structure, you can start sending transactions to PWR Chain. Submit transactions to the PWR Chain to record user actions or data.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    // Write transaction data
    const obj = {
        action: 'send-message-v1',
        message: 'Hello World!',
    };

    const data = new TextEncoder().encode(obj);

    //Send transaction
    const response = wallet.sendVMDataTxn(vidaId, data);

    if(response.sucuccess) {
        console.log("Transaction sent successfully!");
        console.log("Transaction hash: " + response.transactionHash);
    }
    else console.log("Transaction failed: " + response.message);
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    # Write transaction data
    json_object = {
        "action": "send-message-v1",
        "message": "Hello World!"
    }
    data = json.dumps(json_object).encode("utf-8")
    fee_per_byte = wallet.get_rpc().get_fee_per_byte()

    # Send transaction
    response = wallet.send_vida_data(vida_id, data, fee_per_byte)
    if response.success:
        print("Transaction sent successfully!")
        print(f"Transaction hash: 0x{response.hash.hex()}")
    else:
        print(f"Transaction failed: {response.error}")
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    // Write transaction data
    let json_object = serde_json::json!({
        "action": "send-message-v1",
        "message": "Hello World!"
    });
    let data: Vec<u8> = serde_json::to_string(&json_object).unwrap().into_bytes();
    let fee_per_byte = (wallet.get_rpc().await).get_fee_per_byte().await.unwrap();

    // Send transaction
    let response = wallet.send_vida_data(veda_id, data, fee_per_byte).await;
    if response.success {
        println!("Transaction sent successfully!");
        println!("Transaction hash: {:?}", response.data.unwrap());
    } else {
        println!("Transaction failed: {:?}", response.error);
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    // Write transaction data
    jsonObject := map[string]string{
        "action":  "send-message-v1",
        "message": "Hello World!",
    }
    data, _ := json.Marshal(jsonObject)
    feePerByte := wallet.GetRpc().GetFeePerByte()

    // Send transaction
    response := wallet.SendVidaData(vidaId, data, feePerByte)
    if response.Success {
        fmt.Println("Transaction sent successfully!")
        fmt.Printf("Transaction hash: %s\n", response.Hash)
    } else {
        fmt.Printf("Transaction failed: %s\n", response.Error)
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    byte[] data = JsonSerializer.SerializeToUtf8Bytes(new { 
        action = "send-message-v1",
        message = "Hello World!" 
    });

    ulong feePerByte = await wallet.GetRpc().GetFeePerByte();

    WalletResponse response = await wallet.SendVidaData(vidaId, data, feePerByte);
    if (response.Success)
    {
        Console.WriteLine("Transaction sent successfully!");
        Console.WriteLine($"Transaction hash: {response.Hash}");
    }
    else
    {
        Console.WriteLine($"Transaction failed: {response.Error}");
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    //Write transaction data
    JSONObject jsonObject = new JSONObject();
    jsonObject.put("action", "send-message-v1");
    jsonObject.put("message", "Hello World!");
    byte[] data = jsonObject.toString().getBytes(StandardCharsets.UTF_8);

    //Send transaction
    Response response = wallet.sendVmDataTransaction(vidaId, data, wallet.getNonce());
    if(response.isSuccess()) {
        System.out.println("Transaction sent successfully!");
        System.out.println("Transaction hash: " + response.getTransactionHash());
    }
    else System.out.println("Transaction failed: " + response.getError());
    ```
</TabItem>
</Tabs>

### 7. **Read Data from PWR Chain & Handle it**

The PWR SDK provides functions to easily read and handle data from PWR Chain.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    import { PWRJS } from "@pwrjs/core";
    import { hexToBytes } from '@noble/hashes/utils';

    function handler(transaction: VmDataTransaction){
        // Get the address of the transaction sender
        const sender = transaction.sender;
        // Get the data sent in the transaction (In Hex Format)
        let data = transaction.data;
        
        try {
            // Convert data string to bytes
            if (data.startsWith("0x")) data = data.substring(2);
            const bytes = hexToBytes(data);
            const dataStr = new TextDecoder().decode(bytes);
            const dataJson = JSON.parse(dataStr);
            
            // Check the action and execute the necessary code
            if (dataJson.action === "send-message-v1") {
                const message = data.message;
                console.log("Message from " + sender + ": " + message);
            }
        } catch (e) {
            console.error(e)
        }
    }

    async function main() {
        const pwrjs = new PWRJS("https://pwrrpc.pwrlabs.io/");
        const vidaId = 1n; // Replace with your VIDA's ID

        // Since our VIDA is global chat room and we don't care about historical messages,
        // we will start reading transactions startng from the latest PWR Chain block
        const startingBlock = await pwrjs.getBlockNumber();
        
        const subscription = pwrjs.subscribeToVidaTransactions(
            pwrjs,
            BigInt(vidaId),
            BigInt(startingBlock),
            handler
        );

        // To pause, resume, and stop the subscription
        subscription.pause();
        subscription.resume();
        // subscription.stop();

        // To get the latest checked block
        console.log(subscription.getLatestCheckedBlock());
    }
    main();
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrsdk import PWRPY
    from pwrpy.models.Transaction import VidaDataTransaction
    import json
    import time

    rpc = PWRPY("https://pwrrpc.pwrlabs.io/")
    vida_id = 1 # Replace with your VIDA's ID

    # Since our VIDA is global chat room and we don't care about historical messages,
    # we will start reading transactions startng from the latest PWR Chain block
    starting_block = rpc.get_latest_block_number()

    def handle_transaction(txn: VidaDataTransaction):
        try:
            # Get the address of the transaction sender
            sender = txn.sender
            # Get the data sent in the transaction (In Hex Format)
            data_hex = txn.data
            # Convert data string to bytes 
            data_bytes = bytes.fromhex(data_hex[2:])
            obj = json.loads(data_bytes.decode('utf-8'))

            # Check the action and execute the necessary code
            if obj["action"] == "send-message-v1":
                print(f"Message from {sender}: {obj['message']}")

        except Exception as e:
            print(f"Error processing transaction: {e}")

    # To pause, resume, and stop the subscription
    subscription = rpc.subscribe_to_vida_transactions(vida_id, starting_block, handler=handle_transaction)
    subscription.pause()
    subscription.resume()
    # subscription.stop()

    # To get the latest checked block
    print(subscription.get_latest_checked_block())
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::{
        RPC,
        transaction::types::VidaDataTransaction,
    };
    use std::sync::Arc;

    fn handler(txn: VidaDataTransaction) {
        // Get the address of the transaction sender
        let sender = txn.sender;
        // Get the data sent in the transaction (In Hex Format)
        let data = txn.data;
        // Convert data string to bytes
        let data_str = String::from_utf8(data).unwrap();
        let object: serde_json::Value = serde_json::from_str(&data_str).unwrap();
        let obj_map = object.as_object().unwrap();

        // Check the action and execute the necessary code
        if obj_map.get("action").and_then(|val| val.as_str()) == Some("send-message-v1")
        {
            if let Some(message_str) = obj_map
                .get("message")
                .and_then(|val| val.as_str())
            {
                println!("Message from {}: {}", sender, message_str);
            }
        }
    }

    #[tokio::main]
    async fn main() {
        let rpc = RPC::new("https://pwrrpc.pwrlabs.io/").await.unwrap();
        let rpc = Arc::new(rpc);
        let vida_id = 1; // Replace with your VIDA's ID

        // Since our VIDA is global chat room and we don't care about historical messages,
        // we will start reading transactions startng from the latest PWR Chain block
        let starting_block = rpc.get_latest_block_number().await.unwrap();

        let subscription = rpc.subscribe_to_vida_transactions(vida_id, starting_block, handler);

        // To pause, resume, and stop the subscription
        subscription.pause();
        subscription.resume();
        // subscription.stop();

        // To get the latest checked block
        println!("{}", subscription.get_latest_checked_block());

        // To exit the program
        if subscription.is_running() {
            println!("Press Enter to exit...");
            let mut buffer = String::new();
            std::io::stdin().read_line(&mut buffer).unwrap();
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    import (
        "fmt"
        "encoding/json"
        "encoding/hex"

        "github.com/pwrlabs/pwrgo/rpc"
    )

    func handler(transaction rpc.VidaDataTransaction) {
        // Get the address of the transaction sender
        sender := transaction.Sender
        // Get the data sent in the transaction (In Hex Format)
        data := transaction.Data

        // Convert data string to bytes
        dataBytes, _ := hex.DecodeString(data[2:])
        var obj map[string]interface{}
        if err := json.Unmarshal(dataBytes, &obj); err != nil {
            fmt.Println("Error parsing JSON:", err)
        }

        // Check the action and execute the necessary code
        if action, _ := obj["action"].(string); action == "send-message-v1" {
            message, _ := obj["message"].(string)
            fmt.Printf("Message from %s: %s\n", sender, message)
        }
    }

    func main() {
        rpc := rpc.SetRpcNodeUrl("https://pwrrpc.pwrlabs.io")
        vidaId := 1  // Replace with your VIDA's ID

        // Since our VIDA is global chat room and we don't care about historical messages,
        // we will start reading transactions startng from the latest PWR Chain block
        startingBlock := rpc.GetLatestBlockNumber()

        subscription := rpc.SubscribeToVidaTransactions(
            vidaId,
            startingBlock,
            handler,
        )

        // To pause, resume, and stop the subscription
        subscription.Pause()
        subscription.Resume()
        // subscription.Stop()

        // To get the latest checked block
        fmt.Println("Latest checked blocked:", subscription.GetLatestCheckedBlock())

        // To exit the program
        if (subscription.IsRunning()) {
            fmt.Println("Press Enter to exit...")
            fmt.Scanln()
        }
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using System;
    using System.Text;
    using Newtonsoft.Json.Linq;
    using PWR;
    using PWR.Models;
    using PWR.Utils;

    class Program
    {
        public static async Task Main()
        {
            var rpc = new RPC("https://pwrrpc.pwrlabs.io/");
            ulong vidaId = 1; // Replace with your VIDA's ID

            // Since our VIDA is global chat room and we don't care about historical messages,
            // we will start reading transactions startng from the latest PWR Chain block
            ulong startingBlock = await rpc.GetLatestBlockNumber();

            VidaTransactionSubscription subscription = rpc.SubscribeToVidaTransactions(vidaId, startingBlock, (transaction) => {
                // Get the address of the transaction sender
                string sender = transaction.Sender;
                // Get the data sent in the transaction (In Hex Format)
                string data = transaction.Data;

                // Convert data string to bytes
                if (data.StartsWith("0x")) data = data.Substring(2);
                byte[] dataBytes = PWR.Utils.Extensions.HexStringToByteArray(data);
            
                var jsonObject = JObject.Parse(Encoding.UTF8.GetString(dataBytes));
                string action = jsonObject["action"]?.ToString();
                
                // Check the action and execute the necessary code
                if (string.Equals(action, "send-message-v1", StringComparison.OrdinalIgnoreCase)) {
                    string message = jsonObject["message"]?.ToString();
                    Console.WriteLine($"Message from {sender}: {message}");
                }
            });

            // To pause, resume, and stop the subscription
            subscription.Pause();
            subscription.Resume();
            // subscription.Stop();

            // To get the latest checked block
            Console.WriteLine(subscription.GetLatestCheckedBlock());
        }
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    PWRJ pwrj = new PWRJ("https://pwrrpc.pwrlabs.io/");

    long vidaId = 1; // Replace with your VIDA's ID  

    /*Since our VIDA is global chat room and we don't care about historical messages,
    we will start reading transactions startng from the latest PWR Chain block*/
    long startingBlock = pwrj.getBlockNumber();

    VidaTransactionSubscription vidaTransactionSubscription = pwrj.subscribeToVidaTransactions(pwrj, vidaId, startingBlock, (transaction) -> {
        VmDataTransaction vmDataTransaction = transaction;

        //Get the address of the transaction sender
        String sender = vmDataTransaction.getSender();

        //Get the data sent in the transaction (In Hex Format)
        String data = vmDataTransaction.getData();

        try {
            //Decode the data from Hex to byte array
            if (data.startsWith("0x")) data = data.substring(2);
            byte[] dataBytes = Hex.decode(data);

            //Convert the byte array to a JSON Object
            JSONObject jsonObject = new JSONObject(new String(dataBytes));
            String action = jsonObject.optString("action", "no-action");

            //Check the action and execute the necessary code
            if (action.equalsIgnoreCase("send-message-v1")) {
                String message = jsonObject.getString("message");
                System.out.println("Message from " + sender + ": " + message);
            } else {
                //ignore
            }
        } catch (Exception e) {
            e.printStackTrace();

            //This most likely indicates Malformed data from the sender
        }
    });

    //To pause, resume, and stop the subscription
    vidaTransactionSubscription.pause();
    vidaTransactionSubscription.resume();
    // vidaTransactionSubscription.stop();

    //To get the block number of the latest checked PWR Chain block
    vidaTransactionSubscription.getLatestCheckedBlock();
    ```
</TabItem>
</Tabs>

8. **Make Your App Public**

Once your VIDA is ready, share it with others by publishing it:

- **Option 1**: Open-source your code on GitHub with clear instructions.
- **Option 2**: Publish it on the PWR Chain registry for decentralized discovery. (Coming Soon)

## Key Considerations for Stateless VIDAs

- **No State Management**: Stateless VIDAs do not track or validate past transactions, making them fast but unsuitable for critical use cases.
- **Ideal Use Cases**: Applications prioritizing speed and simplicity over consistency (e.g., chat apps, simple games).

By following these steps, you can build a lightweight and efficient Stateless VIDA that leverages the power of PWR Chain while keeping development simple!
