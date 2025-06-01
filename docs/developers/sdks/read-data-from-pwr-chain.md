---
title: Read Data from PWR Chain
sidebar_position: 4
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Read Data from PWR Chain

Reading data from the PWR Chain is a crucial aspect of building decentralized applications (dApps) on the PWR platform. The PWR SDK provides a simple and efficient way to retrieve data from the blockchain, allowing your application to access and utilize the information stored on the chain.

In this guide, we'll explore how to read data from the PWR Chain using the PWR SDK, with a focus on retrieving transaction data and block information.

## Reading Data

The PWR SDK provides various methods to retrieve data from the PWR Chain. Let's look at some common use cases and how to achieve them using the SDK.

### Retrieving Account Balances and Nonces

To retrieve the PWR balance or nonce of a specific account.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const PWRJS = require('@pwrjs/core');

    // Setting up the rpc api
    const rpc = new PWRJS("https://pwrrpc.pwrlabs.io");

    async function account() {
        const address = "0x3b3b69093879e7b6f28366fa3c32762590ff547e";

        // get balance of address
        const balance = await rpc.getBalanceOfAddress(address);
        console.log(`Balance: ${balance}`);
        // get nonce of address
        const nonce = await rpc.getNonceOfAddress(address);
        console.log(`Nonce: ${nonce}`);
    }
    account();
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrsdk import PWRPY

    # Setting up the rpc api
    pwr= PWRPY("https://pwrrpc.pwrlabs.io/")

    def account():
        address = "0x3b3b69093879e7b6f28366fa3c32762590ff547e"

        # get balance of address
        balance = pwr.get_balance_of_address(address)
        print(f"Balance: {balance}")
        # get nonce of address
        nonce = pwr.get_nonce_of_address(address)
        print(f"Nonce: {nonce}")
    account()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::RPC;

    async fn account() {
        // Setting up the rpc api
        let rpc = RPC::new("https://pwrrpc.pwrlabs.io/").await.unwrap();
        let address = "0x3b3b69093879e7b6f28366fa3c32762590ff547e";
        // get balance of address
        let balance = rpc.get_balance_of_address(address).await.unwrap();
        println!("Balance: {balance}");
        // get nonce of address
        let nonce = rpc.get_nonce_of_address(address).await.unwrap();
        println!("Nonce: {nonce}");
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "fmt"
        "github.com/pwrlabs/pwrgo/rpc"
    )

    func account() {
        // Setting up the rpc api
        rpc := rpc.SetRpcNodeUrl("https://pwrrpc.pwrlabs.io")
        address := "0x3b3b69093879e7b6f28366fa3c32762590ff547e"

        // get balance of address
        balance := rpc.GetBalanceOfAddress(address)
        fmt.Println("Balance:", balance)

        // get nonce of address
        nonce := rpc.GetNonceOfAddress(address)
        fmt.Println("Nonce:", nonce)
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;

    class Program
    {
        static async Task Main()
        {
            // Setting up the rpc api
            var rpc = new RPC("https://pwrrpc.pwrlabs.io/");

            string address = "0x3b3b69093879e7b6f28366fa3c32762590ff547e";

            ulong balance = await rpc.GetBalanceOfAddress(address);
            Console.WriteLine($"Balance: {balance}");

            uint nonce = await rpc.GetNonceOfAddress(address);
            Console.WriteLine($"Nonce: {nonce}");
        }
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
</Tabs>


### Retrieving Blocks

Blocks will help us access a lot of data through the set of transactions they contain. In this example, we retrieve a specific block by its block number:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const PWRJS = require('@pwrjs/core');

    // Setting up the rpc api
    const rpc = new PWRJS("https://pwrrpc.pwrlabs.io");

    async function getBlock() {
        // the block number we want fetch
        const blockNumber = 100;
        // get the block by number
        const block = await rpc.getBlockByNumber(blockNumber);

        for (let i in block.transactions) {
            const transaction = await rpc.getTransactionByHash(block.transactions[i].transactionHash);
            console.log(`Sender ${i}: ${transaction.sender}`);
        }
    }
    getBlock();
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrsdk import PWRPY

    # Setting up the rpc api
    pwr= PWRPY("https://pwrrpc.pwrlabs.io/")

    def get_block():
        # the block number we want fetch
        block_number = 100
        # get the block by number
        block = pwr.get_block_by_number(block_number)
        
        # prints the sender address from every transaction in the block
        for index, txs in enumerate(block.transactions):
            transaction = pwr.get_transaction_by_hash(txs.transaction_hash)
            print(f"Sender {index}: {transaction.sender}")
    get_block()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::RPC;

    async fn get_block() {
        // Setting up the rpc api
        let rpc = RPC::new("https://pwrrpc.pwrlabs.io/").await.unwrap();
        // the block number we want fetch
        let block_number = 100;
        // get the block by number
        let block = rpc.get_block_by_number(block_number).await.unwrap();

        // prints the sender address from every transaction in the block
        for (index, txs) in block.transactions.iter().enumerate() {
            let tx = rpc.get_transaction_by_hash(&txs.transaction_hash).await.unwrap();
            println!("Sender {}: {}", index, tx.sender);
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "fmt"
        "github.com/pwrlabs/pwrgo/rpc"
    )

    func getBlock() {
        // Setting up the rpc api
        rpc := rpc.SetRpcNodeUrl("https://pwrrpc.pwrlabs.io")
        // the block number we want fetch
        blockNumber := 100

        // get the block by number
        block := rpc.GetBlockByNumber(blockNumber)

        for i, txs := range block.Transactions {
            transaction := pwr.GetTransactionByHash(txs.TransactionHash)
            fmt.Printf("Sender %d: %s\n", i, transaction.Sender)
        }
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;

    class Program
    {
        static async Task Main()
        {
            // Setting up the rpc api
            var rpc = new RPC("https://pwrrpc.pwrlabs.io/");
            // the block number we want fetch
            uint blockNumber = 100;

            // get the block by number
            var block = await rpc.GetBlockByNumber(blockNumber);
            
            for (int i = 0; i < block.Transactions.Count; i++)
            {
                var tx = await rpc.GetTransactionByHash(block.Transactions[i].TransactionHash);
                Console.WriteLine($"Sender {i}: {tx.Sender}");
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

You can access and process the block data according to your application's needs, such as analyzing transaction patterns, tracking specific events, or updating your application's state based on the block information.

### Retrieving VIDA Data Transactions

One of the fetch operations that you will need a lot is fetching VIDA transactions to process data and sender and many more ideas that we will explain in the upcoming lessons.

In this example, we retrieve all VIDA data transactions sent to a specific VIDA (identified by `vidaId`) within a given block range (`startBlock` to `endBlock`):

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const PWRJS = require('@pwrjs/core');

    // Setting up the rpc api
    const rpc = new PWRJS("https://pwrrpc.pwrlabs.io");

    async function getVidaData() {
        const startBlock = 85411;
        const endBlock = 85420;
        const vidaId = 123;

        // fetch the transactions sent from `startBlock` to `endBlock` in `vidaId`
        const transactions = await rpc.getVidaDataTransactions(startBlock, endBlock, vidaId);

        // prints the trasnactions data
        for (let txs of transactions) {
            console.log("Data:", txs.data);
        }
    }
    getVidaData();
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrsdk import PWRPY

    # Setting up the rpc api
    pwr= PWRPY("https://pwrrpc.pwrlabs.io/")

    def get_vida_data():
        start_block = 85411
        end_block = 85420
        vida_id = 123

        # fetch the transactions sent from `start_block` to `end_block` in `vida_id`
        transactions = pwr.get_vida_data_transactions(start_block, end_block, vida_id)
        # prints the trasnactions data
        for txs in transactions:
            print("Data:", txs.data)
    get_vida_data()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::RPC;

    async fn get_vida_data() {
        // Setting up the rpc api
        let rpc = RPC::new("https://pwrrpc.pwrlabs.io/").await.unwrap();

        let start_block = 85411;
        let end_block = 85420;
        let vida_id = 123;

        // fetch the transactions sent from `start_block` to `end_block` in `vida_id`
        let transactions = rpc.get_vida_data_transactions(start_block, end_block, vida_id).await.unwrap();
        // prints the trasnactions data
        for txs in transactions {
            println!("Data: {:?}", hex::encode(&txs.data));
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "fmt"
        "github.com/pwrlabs/pwrgo/rpc"
    )

    func getVidaData() {
        // Setting up the rpc api
        rpc := rpc.SetRpcNodeUrl("https://pwrrpc.pwrlabs.io")
        startBlock := 85411
        endBlock := 85420
        vidaId := 123

        // fetch the transactions sent from `startBlock` to `endBlock` in `vidaId`
        transactions := rpc.GetVidaDataTransactions(startBlock, endBlock, vidaId)

        for _, tx := range transactions {
            fmt.Println("Data:", tx.Data)
        }
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;

    class Program
    {
        static async Task Main()
        {
            // Setting up the rpc api
            var rpc = new RPC("https://pwrrpc.pwrlabs.io/");

            ulong startBlock = 85411;
            ulong endBlock = 85420;
            ulong vidaId = 123;

            // fetch the transactions sent from `startBlock` to `endBlock` in `vidaId`
            var transactions = await rpc.GetVidaDataTransactions(startBlock, endBlock, vidaId);
            foreach (var txn in transactions)
            {
                Console.WriteLine($"Data: {txn.Data}");
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

You can process the transaction data according to your application's requirements, such as decoding it, storing it, or triggering specific actions based on the data.

## Handling Data Encoding and Decoding

When reading data from the PWR Chain, it's important to consider the encoding and decoding of data. The PWR SDK provides utility classes and methods to assist with these tasks.

For example, if you are working with hexadecimal-encoded data in `Java`, you can use the Hex class provided by the SDK to decode the data into byte arrays or strings.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    async function decoding() {
        const hexData = "0x48656C6C6F20576F726C6421";

        // Remove the '0x' prefix and decode the hexadecimal data to bytes data
        const decodedData = Buffer.from(hexData.slice(2), 'hex');
        // Convert the decoded data to a UTF-8 string
        const stringData = decodedData.toString('utf8');

        console.log(`Outputs: ${stringData}`); // Outputs: Hello World!
    }
    decoding()
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    def decoding():
        hex_data = "0x48656C6C6F20576F726C6421"

        # Remove the '0x' prefix and decode the hexadecimal data to bytes data
        decoded_data = bytes.fromhex(hex_data[2:])
        # Convert the decoded data to a UTF-8 string
        string_data = decoded_data.decode('utf-8')

        print(f'Outputs: {string_data}') # Outputs: Hello World!
    decoding()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use hex;
    fn decoding() {
        let hex_data = "0x48656C6C6F20576F726C6421";

        // Remove the '0x' prefix and decode the hexadecimal data to bytes data
        let decoded_data = hex::decode(&hex_data[2..]).expect("Decoding failed");
        // Convert the decoded data to a UTF-8 string
        let string_data = String::from_utf8(decoded_data).expect("Invalid UTF-8");

        println!("Outputs: {}", string_data); // Outputs: Hello World!
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "fmt"
        "encoding/hex"
    )

    func decoding() {
        hexData := "0x48656C6C6F20576F726C6421" // hex data

        // Remove the '0x' prefix and decode the hexadecimal data to bytes data
        decodedData, _ := hex.DecodeString(hexData[2:])
        // Convert the decoded data to a UTF-8 string
        stringData := string(decodedData)

        fmt.Printf("Outputs: %s\n", stringData) // Outputs: Hello World!
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;
    using System.Text;

    class Program
    {
        static void Main()
        {
            string hexData = "0x48656C6C6F20576F726C6421";

            // Remove the '0x' prefix and decode the hexadecimal data to bytes data
            string hexWithoutPrefix = hexData.StartsWith("0x") ? hexData[2..] : hexData;
            byte[] bytes = Extensions.HexStringToByteArray(hexWithoutPrefix);
            // Convert the decoded data to a UTF-8 string
            string stringData = Encoding.UTF8.GetString(bytes);

            Console.WriteLine($"Outputs: {stringData}");
        }
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
</Tabs>

## Handling Retrieved Data

Once you have retrieved data from the PWR Chain, you can process and handle it according to your application's requirements. Here are a few examples of handling the retrieved data:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const PWRJS = require('@pwrjs/core');

    // Setting up the rpc api
    const rpc = new PWRJS("https://pwrrpc.pwrlabs.io");

    async function getVidaDataActive() {
        const startBlock = 85411;
        const endBlock = 85420;
        const vidaId = 123;

        // fetch the transactions sent from `startBlock` to `endBlock` in `vidaId`
        const transactions = await rpc.getVidaDataTransactions(startBlock, endBlock, vidaId);

        for (let txs of transactions) {
            const sender = txs.sender;
            const data = txs.data;

            // Decode the hexadecimal data to bytes data
            const decodedData = Buffer.from(data, 'hex');
            // Convert the bytes data to a UTF-8 string
            const stringData = decodedData.toString('utf8');
            
            if (stringData.startsWith("Hi")) {
                const word = stringData.substring(3);
                console.log(`${sender}: ${word}`);
            }
            else if (stringData.startsWith("Hello")) {
                const word = stringData.substring(6);
                console.log(`${sender}: ${word}`)
            }
        }
    }
    getVidaDataActive();
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrsdk import PWRPY

    # Setting up the rpc api
    pwr= PWRPY("https://pwrrpc.pwrlabs.io/")

    def get_vida_data_active():
        start_block = 85411
        end_block = 85420
        vida_id = 123
        # fetch the transactions sent from `start_block` to `end_block` in `vida_id`
        transactions = pwr.get_vida_data_transactions(start_block, end_block, vida_id)

        for txs in transactions:
            sender = txs.sender
            data = txs.data

            # Decode the hexadecimal data to bytes data
            decoded_data = bytes.fromhex(data)
            # Convert the bytes data to a UTF-8 string
            string_data = decoded_data.decode('utf-8')

            if string_data.startswith("Hi"):
                word = string_data[3:]
                print(f'{sender}: {word}')
            elif string_data.startswith("Hello"):
                word = string_data[6:]
                print(f'{sender}: {word}')
    get_vida_data_active()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::RPC;

    async fn get_vida_data_active() {
        // Setting up the rpc api
        let rpc = RPC::new("https://pwrrpc.pwrlabs.io/").await.unwrap();
        let start_block = 85411;
        let end_block = 85420;
        let vida_id = 123;

        // fetch the transactions sent from `start_block` to `end_block` in `vida_id`
        let transactions = rpc.get_vida_data_transactions(start_block, end_block, vida_id).await.unwrap();

        for txs in transactions {
            let sender = txs.sender;
            let data = txs.data;

            // Convert the bytes data to a UTF-8 string
            let string_data = String::from_utf8(data.clone()).expect("Invalid UTF-8");

            if string_data.starts_with("Hi") {
                let word = &string_data[3..];
                println!("{}: {}", sender, word);
            }
            else if string_data.starts_with("Hello") {
                let word = &string_data[6..];
                println!("{}: {}", sender, word);
            }
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "github.com/pwrlabs/pwrgo/rpc"
        "fmt"
        "encoding/hex"
        "strings"
    )

    func getVidaDataActive() {
        // Setting up the rpc api
        rpc := rpc.SetRpcNodeUrl("https://pwrrpc.pwrlabs.io")

        startBlock := 85411
        endBlock := 85420
        vidaId := 123

        // fetch the transactions sent from `startBlock` to `endBlock` in `vidaId`
        transactions := rpc.GetVidaDataTransactions(startBlock, endBlock, vidaId)

        for _, tx := range transactions {
            sender := tx.Sender
            data := tx.Data

            // Decode the hexadecimal data to bytes data
            decodedData, err := hex.DecodeString(data)
            if err != nil {
                fmt.Println("Error decoding hex:", err)
                continue
            }

            // Convert the decoded data to a UTF-8 string
            stringData := string(decodedData)

            if strings.HasPrefix(stringData, "Hi") {
                word := stringData[2:]
                fmt.Printf("%s: %s\n", sender, word)
            } else if strings.HasPrefix(stringData, "Hello") {
                word := stringData[5:]
                fmt.Printf("%s: %s\n", sender, word)
            }
        }
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;
    using PWR.Utils;
    using System.Text;

    class Program
    {
        static async Task Main()
        {
            // Setting up the rpc api
            var rpc = new RPC("https://pwrrpc.pwrlabs.io/");

            ulong startBlock = 85411;
            ulong endBlock = 85420;
            ulong vidaId = 123;

            // fetch the transactions sent from `startBlock` to `endBlock` in `vidaId`
            var transactions = await rpc.GetVidaDataTransactions(startBlock, endBlock, vidaId);

            foreach (var txn in transactions)
            {
                string sender = txn.Sender;
                string data = txn.Data;

                // Decode the hexadecimal data to bytes data
                byte[] bytes = Extensions.HexStringToByteArray(data);
                // Convert the bytes data to a UTF-8 string
                string stringData = Encoding.UTF8.GetString(bytes);

                if (stringData.StartsWith("Hi"))
                {
                    string word = stringData[3..];
                    Console.WriteLine($"{sender}: {word}");
                }
                else if (stringData.StartsWith("Hello"))
                {
                    string word = stringData[6..];
                    Console.WriteLine($"{sender}: {word}");
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

As you see, in the implementation of `Rust` we did not convert the data from `hex` to `bytes` data because in Rust we get the data value as bytes directly.

## Best Practices

When reading data from the PWR Chain, consider the following best practices:

1. **Efficient Data Retrieval**: Optimize your data retrieval logic to minimize the number of requests made to the PWR Chain. Retrieve data in batches or use caching mechanisms to reduce network overhead and improve performance.
2. **Asynchronous Processing**: Utilize asynchronous programming techniques to prevent blocking the main application thread while waiting for data retrieval. This ensures a responsive user experience and allows for parallel processing of data.
3. **Error Handling and Logging**: Implement robust error handling mechanisms and logging to diagnose and troubleshoot issues related to data retrieval. Log relevant information such as error messages, stack traces, and request/response details for debugging purposes.
4. **Data Validation and Sanitization**: Validate and sanitize the data retrieved from the PWR Chain before using it in your application. Ensure that the data conforms to expected formats, ranges, and constraints to prevent security vulnerabilities or unexpected behavior.
5. **Secure Data Handling**: When dealing with sensitive or confidential data retrieved from the PWR Chain, employ secure practices such as encryption, access controls, and secure storage to protect the data from unauthorized access or tampering.

By following these best practices and leveraging the PWR SDK's data retrieval capabilities, you can efficiently and securely read data from the PWR Chain and build robust decentralized applications on the PWR platform.
