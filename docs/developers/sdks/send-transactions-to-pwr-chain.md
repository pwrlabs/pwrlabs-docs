---
title: Send Transactions to PWR Chain
sidebar_position: 3
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Send Transactions to PWR Chain

Sending transactions is a fundamental operation when interacting with the PWR Chain. The PWR SDK provides a simple and intuitive way to send various types of transactions within your software application.

## PWR Chain Faucet

To send transactions to PWR Chain you need to have some coins in your wallet. You can use [**PWR Chain faucet**](https://faucet.pwrlabs.io/) to get some testnet coins.

Just add your wallet address and then claim your coins by clicking on "Give Me 10 PWR".

## PWR Chain Transactions

To send transactions to PWR Chain, all what you need's setup the PWR SDK in your project and create wallet as we did in the previous lessons, and check the address balance so that you have enough gas fees.

Types of PWR Chain transactions - there are many types of PWR SDKs, in this guide we will focus on the following:

- [**`Transfer PWR`**](#transfer-pwr): Transfers PWR tokens from one wallet to another, facilitating token movement within the network.
- [**`Send VIDA Data`**](#send-vm-data): Sends data to a specific virtual machine for storage and processing purposes.
- [**`Send Payable VIDA Data`**](#send-payable-vm-data): Sends data to a specific virtual machine (VIDA) and transfers PWR tokens to the VIDA as part of the operation.
- [**`Delegate`**](#delegate-pwr-tokens): Delegates a specified amount of PWR tokens to a validator, contributing to their staking power.
- [**`Withdraw`**](#withdraw-delegated-pwr-tokens): Withdraws PWR tokens that were previously delegated to a validator, returning them to the user’s wallet.
- [**`Move Stake`**](#move-stake-between-validators): Moves staked PWR tokens from one validator to another, allowing for flexibility in staking management.
- [**`Set Guardian`**](#set-guardian): Assigns a trusted guardian to the user’s wallet, providing an added layer of security and control.
- [**`Remove Guardian`**](#remove-guardian): Remove the guardian assigned to the wallet, removing their access or control.

### Transfer PWR

To transfer PWR tokens from one wallet to another, use the transfer PWR method:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRWallet } = require('@pwrjs/core');

    // Setting up your wallet in the SDK
    const privateKey = "YOUR_PRIVATE_KEY_HERE";
    const wallet = new PWRWallet(privateKey);

    async function transfer() {
        // Tokens recipient address
        const recipientAddress = "RECIPIENT_ADDRESS";
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        const amount = 1e3;
        // Transfer pwr tokens from the wallet
        const tx = await wallet.transferPWR(recipientAddress, amount);
        
        // Error handling
        if (tx.success) {
            console.log("Transaction Hash:", tx.transactionHash);
        } else {
            console.log("Error:", tx.message);
        }
    }
    transfer();
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrwallet import PWRWallet

    # Setting up your wallet in the SDK
    private_key = "YOUR_PRIVATE_KEY_HERE"
    wallet = PWRWallet(private_key)

    def transfer():
        # Tokens recipient address
        recipient_address = "RECIPIENT_ADDRESS"
        # Tokens amount - 1 PWR = 1e9 = 1000000000
        amount = 1000
        # Transfer pwr tokens from the wallet
        tx = wallet.transfer_pwr(recipient_address, amount)

        # Error handling
        if tx.success:
            print("Transaction Hash:", tx.data)
        else:
            print("Error:", tx.message)
    transfer()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::Wallet;

    async fn transfer() {
        // Setting up your wallet in the SDK
        let private_key = "YOUR_PRIVATE_KEY_HERE";
        let wallet = Wallet::from_hex(&private_key).unwrap();

        // Tokens recipient address
        let recipient_address = "RECIPIENT_ADDRESS".to_string();
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        let amount = 1000;

        // Transfer pwr tokens from the wallet
        let tx = wallet.transfer_pwr(recipient_address, amount).await;

        // Error handling
        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "github.com/pwrlabs/pwrgo/wallet"
        "fmt"
    )

    // Add your private key here
    var privateKey = "YOUR_PRIVATE_KEY_HERE"

    func transfer() {
        // Setting up your wallet in the SDK
        wallet := wallet.FromPrivateKey(privateKey)

        // Tokens recipient address
        recipientAddress := "RECIPIENT_ADDRESS"
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        amount := int(1e3)
        // Transfer pwr tokens from the wallet
        tx := wallet.TransferPWR(recipientAddress, amount)

        // Error handling
        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;
    using PWR.Models;

    class Program
    {
        static async Task Main()
        {
            // Add your private key here
            string privateKey = "YOUR_PRIVATE_KEY_HERE";
            // Setting up your wallet in the SDK
            var wallet = new PwrWallet(privateKey);

            // Tokens recipient address
            string recipientAddress = "RECIPIENT_ADDRESS";
            // Tokens amount - 1 PWR = 1e9 = 1000000000
            ulong amount = 1000;

            // Transfer pwr tokens from the wallet
            WalletResponse tx = await wallet.TransferPWR(recipientAddress, amount);

            // Error handling
            if (tx.Success) {
                Console.WriteLine($"Transaction Hash: {tx.TxnHash}");
            } else {
                Console.WriteLine($"Error: {tx.Error}");
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

### Send VIDA Data

Sends data to a specific virtual machine for storage and processing purposes.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRWallet } = require('@pwrjs/core');

    // Setting up your wallet in the SDK
    const privateKey = "YOUR_PRIVATE_KEY_HERE";
    const wallet = new PWRWallet(privateKey);

    async function sendData() {
        // VIDA used to send the transaction to
        const vidaId = 123;
        // Buffer data to be included in the transaction
        const data = Buffer.from('Hello World!');
        
        // Send the data at vidaId 123 to the chain
        const tx = await wallet.sendVMDataTxn(vidaId, data);

        // Error handling
        if (tx.success) {
            console.log("Transaction Hash:", tx.transactionHash);
        } else {
            console.log("Error:", tx.message);
        }
    }
    sendData()
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrwallet import PWRWallet

    # Setting up your wallet in the SDK
    private_key = "YOUR_PRIVATE_KEY_HERE"
    wallet = PWRWallet(private_key)

    def send_data():
        # VIDA used to send the transaction to
        vida_id = 123
        # Buffer data to be included in the transaction
        data = "Hello World!".encode()

        # Send the data at vida_id 123 to the chain
        tx = wallet.send_vm_data_transaction(vida_id, data)

        # Error handling
        if tx.success:
            print("Transaction Hash:", tx.data)
        else:
            print("Error:", tx.message)
    send_data()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::Wallet;

    async fn send_data() {
        // Setting up your wallet in the SDK
        let private_key = "YOUR_PRIVATE_KEY_HERE";
        let wallet = Wallet::from_hex(&private_key).unwrap();

        // VIDA used to send the transaction to
        let vida_id = 123;
        // Buffer data to be included in the transaction
        let data = vec!["Hello World!"];
        let data_as_bytes: Vec<u8> = data.into_iter().flat_map(|s| s.as_bytes().to_vec()).collect();

        // Send the data at vida_id 123 to the chain
        let tx = wallet.send_vm_data(vida_id, data_as_bytes).await;

        // Error handling
        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "github.com/pwrlabs/pwrgo/wallet"
        "fmt"
    )

    // Add your private key here
    var privateKey = "YOUR_PRIVATE_KEY_HERE"

    func sendData() {
        // Setting up your wallet in the SDK
        wallet := wallet.FromPrivateKey(privateKey)
        // VIDA used to send the transaction to
        vidaId := 123
        // Buffer data to be included in the transaction
        data := []byte("Hello world")

        // Send the data at vidaId 123 to the chain
        tx := wallet.SendVMData(vidaId, data)

        // Error handling
        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;
    using PWR.Models;
    using System.Text;

    class Program
    {
        static async Task Main()
        {
            // Add your private key here
            string privateKey = "YOUR_PRIVATE_KEY_HERE";
            // Setting up your wallet in the SDK
            var wallet = new PwrWallet(privateKey);

            // VIDA used to send the transaction to
            uint vidaId = 123;
            // Byte data to be included in the transaction
            byte[] data = Encoding.UTF8.GetBytes("Hello, World!");

            // Send the data at vidaId 123 to the chain
            WalletResponse tx = await wallet.SendVMData(vidaId, data);

            // Error handling
            if (tx.Success) {
                Console.WriteLine($"Transaction Hash: {tx.TxnHash}");
            } else {
                Console.WriteLine($"Error: {tx.Error}");
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

You must have wondered, why doesn’t the VIDA work specifically to suit my needs and the rules I want? It seems random? Of course not, we will explain this in the next guide on [**Claim a VIDA**](/developers/sdks/claim-a-vida). KEEP DIVING IN.

### Send Payable VIDA Data

Sends data to a specific virtual machine (VIDA) and transfers PWR tokens to the VIDA as part of the operation.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRWallet } = require('@pwrjs/core');

    // Setting up your wallet in the SDK
    const privateKey = "YOUR_PRIVATE_KEY_HERE";
    const wallet = new PWRWallet(privateKey);

    async function sendPayableData() {
        // VIDA used to send the transaction to
        const vidaId = 919;
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        const amount = 1000;
        // Buffer data to be included in the transaction
        const data = Buffer.from('Hello World!');
        
        // Send the data at vidaId 919 and pay 1e3
        const tx = await wallet.sendPayableVmDataTransaction(vidaId, amount, data);

        // Error handling
        if (tx.success) {
            console.log("Transaction Hash:", tx.transactionHash);
        } else {
            console.log("Error:", tx.message);
        }
    }
    sendPayableData()
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrwallet import PWRWallet

    # Setting up your wallet in the SDK
    private_key = "YOUR_PRIVATE_KEY_HERE"
    wallet = PWRWallet(private_key)

    def send_payable_data():
        # VIDA used to send the transaction to
        vida_id = 919
        # Tokens amount - 1 PWR = 1e9 = 1000000000
        amount = 1000
        # Buffer data to be included in the transaction
        data = "Hello World!".encode()

        # Send the data at vida_id 919 and pay 1e3
        tx = wallet.send_payable_vm_data_transaction(vida_id, amount, data)

        # Error handling
        if tx.success:
            print("Transaction Hash:", tx.data)
        else:
            print("Error:", tx.message)
    send_payable_data()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::Wallet;

    async fn send_payable_data() {
        // Setting up your wallet in the SDK
        let private_key = "YOUR_PRIVATE_KEY_HERE";
        let wallet = Wallet::from_hex(&private_key).unwrap();

        // VIDA used to send the transaction to
        let vida_id = 919;
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        let amount = 1000;
        // Buffer data to be included in the transaction
        let data = vec!["Hello World!"];
        let data_as_bytes: Vec<u8> = data.into_iter().flat_map(|s| s.as_bytes().to_vec()).collect();

        // Send the data at vida_id 919 and pay 1e3
        let tx = wallet.send_payable_vm_data(vida_id, amount, data_as_bytes).await;

        // Error handling
        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "github.com/pwrlabs/pwrgo/wallet"
        "fmt"
    )

    // Add your private key here
    var privateKey = "YOUR_PRIVATE_KEY_HERE"

    func sendPayableData() {
        // Setting up your wallet in the SDK
        wallet := wallet.FromPrivateKey(privateKey)
        // VIDA used to send the transaction to
        vidaId := 919
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        amount := 10
        // Buffer data to be included in the transaction
        data := []byte("Hello world")

        // Send the data at vidaId 919 and pay 1e3
        tx := wallet.SendPayableVMData(vidaId, amount, data)

        // Error handling
        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;
    using PWR.Models;
    using System.Text;

    class Program
    {
        static async Task Main()
        {
            // Add your private key here
            string privateKey = "YOUR_PRIVATE_KEY_HERE";
            // Setting up your wallet in the SDK
            var wallet = new PwrWallet(privateKey);

            // VIDA used to send the transaction to
            ulong vidaId = 919;
            // Tokens amount - 1 PWR = 1e9 = 1000000000
            ulong amount = 1000;
            // Byte data to be included in the transaction
            byte[] data = Encoding.UTF8.GetBytes("Hello, World!");

            // Send the data at vidaId 919 and pay 1e3
            WalletResponse tx = await wallet.SendPayableVMData(vidaId, amount, data);

            // Error handling
            if (tx.Success) {
                Console.WriteLine($"Transaction Hash: {tx.TxnHash}");
            } else {
                Console.WriteLine($"Error: {tx.Error}");
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

### Delegate PWR Tokens

Delegates a specified amount of PWR tokens to a validator, contributing to their staking power.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRWallet } = require('@pwrjs/core');

    // Setting up your wallet in the SDK
    const privateKey = "YOUR_PRIVATE_KEY_HERE";
    const wallet = new PWRWallet(privateKey);

    async function delegate() {
        // Validator address
        const validator = "VALIDATOR_ADDRESS";
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        const amount = 1e9;
        
        // Delegate the validator
        const tx = await wallet.delegate(validator, amount);

        // Error handling
        if (tx.success) {
            console.log("Transaction Hash:", tx.transactionHash);
        } else {
            console.log("Error:", tx.message);
        }
    }
    delegate()
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrwallet import PWRWallet

    # Setting up your wallet in the SDK
    private_key = "YOUR_PRIVATE_KEY_HERE"
    wallet = PWRWallet(private_key)

    def delegate():
        # Validator address
        validator = "VALIDATOR_ADDRESS"
        # Tokens amount - 1 PWR = 1e9 = 1000000000
        amount = 1000000000

        # Delegate the validator
        tx = wallet.delegate(validator, amount)

        # Error handling
        if tx.success:
            print("Transaction Hash:", tx.data)
        else:
            print("Error:", tx.message)
    delegate()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::Wallet;

    async fn delegate() {
        // Setting up your wallet in the SDK
        let private_key = "YOUR_PRIVATE_KEY_HERE";
        let wallet = Wallet::from_hex(&private_key).unwrap();

        // Validator address
        let validator = "VALIDATOR_ADDRESS".to_string();
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        let amount = 1000000000;

        // Delegate the validator
        let tx = wallet.delegate(validator, amount).await;

        // Error handling
        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "github.com/pwrlabs/pwrgo/wallet"
        "fmt"
    )

    // Add your private key here
    var privateKey = "YOUR_PRIVATE_KEY_HERE"

    func delegate() {
        // Setting up your wallet in the SDK
        wallet := wallet.FromPrivateKey(privateKey)

        // Validator address
        validator := "VALIDATOR_ADDRESS"
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        amount := int(1e9)

        // Delegate the validator
        tx := wallet.Delegate(validator, amount)

        // Error handling
        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;
    using PWR.Models;

    class Program
    {
        static async Task Main()
        {
            // Add your private key here
            string privateKey = "YOUR_PRIVATE_KEY_HERE";
            // Setting up your wallet in the SDK
            var wallet = new PwrWallet(privateKey);
            
            // Validator address
            string validator = "VALIDATOR_ADDRESS";
            // Tokens amount - 1 PWR = 1e9 = 1000000000
            ulong amount = 1000000000;

            // Delegate the validator
            WalletResponse tx = await wallet.Delegate(validator, amount);

            // Error handling
            if (tx.Success) {
                Console.WriteLine($"Transaction Hash: {tx.TxnHash}");
            } else {
                Console.WriteLine($"Error: {tx.Error}");
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

### Withdraw Delegated PWR Tokens

Withdraws PWR tokens that were previously delegated to a validator, returning them to the user’s wallet.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRWallet } = require('@pwrjs/core');

    // Setting up your wallet in the SDK
    const privateKey = "YOUR_PRIVATE_KEY_HERE";
    const wallet = new PWRWallet(privateKey);

    async function withdraw() {
        // Validator address you delegated
        const validator = "VALIDATOR_ADDRESS";
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        const amount = 1e9;
        
        // Withdraw the delegated pwr tokens
        const tx = await wallet.withdraw(validator, amount);

        // Error handling
        if (tx.success) {
            console.log("Transaction Hash:", tx.transactionHash);
        } else {
            console.log("Error:", tx.message);
        }
    }
    withdraw()
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrwallet import PWRWallet

    # Setting up your wallet in the SDK
    private_key = "YOUR_PRIVATE_KEY_HERE"
    wallet = PWRWallet(private_key)

    def withdraw():
        # Validator address you delegated
        validator = "VALIDATOR_ADDRESS"
        # Tokens amount - 1 PWR = 1e9 = 1000000000
        amount = 1000000000

        # Withdraw the delegated pwr tokens
        tx = wallet.withdraw(validator, amount)

        # Error handling
        if tx.success:
            print("Transaction Hash:", tx.data)
        else:
            print("Error:", tx.message)
    withdraw()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::Wallet;

    async fn withdraw() {
        // Setting up your wallet in the SDK
        let private_key = "YOUR_PRIVATE_KEY_HERE";
        let wallet = Wallet::from_hex(&private_key).unwrap();

        // Validator address you delegated
        let validator = "VALIDATOR_ADDRESS".to_string();
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        let amount = 1000000000;

        // Withdraw the delegated pwr tokens
        let tx = wallet.withdraw(validator, amount).await;

        // Error handling
        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "github.com/pwrlabs/pwrgo/wallet"
        "fmt"
    )

    // Add your private key here
    var privateKey = "YOUR_PRIVATE_KEY_HERE"

    func withdraw() {
        // Setting up your wallet in the SDK
        wallet := wallet.FromPrivateKey(privateKey)

        // Validator address
        validator := "VALIDATOR_ADDRESS"
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        amount := int(1e9)

        // Withdraw the delegated pwr tokens
        tx := wallet.Withdraw(validator, amount)

        // Error handling
        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;
    using PWR.Models;

    class Program
    {
        static async Task Main()
        {
            // Add your private key here
            string privateKey = "YOUR_PRIVATE_KEY_HERE";
            // Setting up your wallet in the SDK
            var wallet = new PwrWallet(privateKey);
            
            // Validator address you delegated
            string validator = "VALIDATOR_ADDRESS";
            // Tokens amount - 1 PWR = 1e9 = 1000000000
            ulong amount = 1000000000;

            // Withdraw the delegated pwr tokens
            WalletResponse tx = await wallet.Withdraw(validator, amount);

            // Error handling
            if (tx.Success) {
                Console.WriteLine($"Transaction Hash: {tx.TxnHash}");
            } else {
                Console.WriteLine($"Error: {tx.Error}");
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

### Move Stake Between Validators

To move delegated stake from one validator to another.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRWallet } = require('@pwrjs/core');

    // Setting up your wallet in the SDK
    const privateKey = "YOUR_PRIVATE_KEY_HERE";
    const wallet = new PWRWallet(privateKey);

    async function moveStake() {
        const fromValidator = "FROM_VALIDATOR_ADDRESS";
        const toValidator = "TO_VALIDATOR_ADDRESS";
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        const amount = 1e9;
        
        // Move stake token from validator to another
        const tx = await wallet.moveStake(amount, fromValidator, toValidator);

        // Error handling
        if (tx.success) {
            console.log("Transaction Hash:", tx.transactionHash);
        } else {
            console.log("Error:", tx.message);
        }
    }
    moveStake()
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrwallet import PWRWallet

    # Setting up your wallet in the SDK
    private_key = "YOUR_PRIVATE_KEY_HERE"
    wallet = PWRWallet(private_key)

    def move_stake():
        from_validator = "FROM_VALIDATOR_ADDRESS"
        to_validator = "TO_VALIDATOR_ADDRESS"
        # Tokens amount - 1 PWR = 1e9 = 1000000000
        amount = 1000000000

        # Move stake token from validator to another
        tx = wallet.move_stake(amount, from_validator, to_validator)

        # Error handling
        if tx.success:
            print("Transaction Hash:", tx.data)
        else:
            print("Error:", tx.message)
    move_stake()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::Wallet;

    async fn move_stake() {
        // Setting up your wallet in the SDK
        let private_key = "YOUR_PRIVATE_KEY_HERE";
        let wallet = Wallet::from_hex(&private_key).unwrap();

        let from_validator = "FROM_VALIDATOR_ADDRESS".to_string();
        let to_validator = "TO_VALIDATOR_ADDRESS".to_string();
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        let amount = 1000000000;

        // Move stake token from validator to another
        let tx = wallet.move_stake(amount, from_validator, to_validator).await;

        // Error handling
        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "github.com/pwrlabs/pwrgo/wallet"
        "fmt"
    )

    // Add your private key here
    var privateKey = "YOUR_PRIVATE_KEY_HERE"

    func moveStake() {
        // Setting up your wallet in the SDK
        wallet := wallet.FromPrivateKey(privateKey)

        fromValidator := "FROM_VALIDATOR_ADDRESS"
        toValidator := "TO_VALIDATOR_ADDRESS"
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        amount := int(1e9)

        // Move stake token from validator to another
        tx := wallet.MoveStake(amount, fromValidator, toValidator)

        // Error handling
        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;
    using PWR.Models;

    class Program
    {
        static async Task Main()
        {
            // Add your private key here
            string privateKey = "YOUR_PRIVATE_KEY_HERE";
            // Setting up your wallet in the SDK
            var wallet = new PwrWallet(privateKey);
            
            string fromValidator = "FROM_VALIDATOR_ADDRESS";
            string toValidator = "TO_VALIDATOR_ADDRESS";
            // Tokens amount - 1 PWR = 1e9 = 1000000000
            ulong amount = 100000000;

            // Move stake token from validator to another
            WalletResponse tx = await wallet.MoveStake(amount, fromValidator, toValidator);

            // Error handling
            if (tx.Success) {
                Console.WriteLine($"Transaction Hash: {tx.TxnHash}");
            } else {
                Console.WriteLine($"Error: {tx.Error}");
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

### Set Guardian

Adding a guardian to your wallet greatly enhances the security of your wallet from mistakes or hacks.

Assigns a trusted guardian to your wallet, providing an added layer of security and control.

Here's how the guardian process works:
1. Alice designates Bob as her wallet guardian.
2. Alice initiates a transaction, sending 1 PWR to Eve.
3. The transaction is placed in a queue, awaiting Bob's approval. He can either approve it or reject it if something seems suspicious.
4. Eve will receive the 1 PWR only after Bob approves the transaction.
5. Mallory has already obtained Alice's wallet's private key and successfully stolen all of her coins.
6. Mallory's transaction will remain in the queue and can only be executed if Bob approves it.
7. Since Bob rejects the suspicious transaction, Mallory was unable to steal any of Alice's coins.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRWallet } = require('@pwrjs/core');

    // Setting up your wallet in the SDK
    const privateKey = "YOUR_PRIVATE_KEY_HERE";
    const wallet = new PWRWallet(privateKey);

    async function setGuardian() {
        // Guardian address that will verify your transactions
        const guardian = "GUARDIAN_ADDRESS";

        // Guardian validity period - 30 minutes
        const futureDate = new Date();
        futureDate.setDate(futureDate.getMinutes() + 30); // 30 minutes from now
        const expiryDate = Math.floor(futureDate.getTime() / 1000);
        
        // Set your wallet guardian
        const tx = await wallet.setGuardian(guardian, expiryDate);

        // Error handling
        if (tx.success) {
            console.log("Transaction Hash:", tx.transactionHash);
        } else {
            console.log("Error:", tx.message);
        }
    }
    setGuardian()
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrwallet import PWRWallet
    import time
    from datetime import datetime, timedelta

    # Setting up your wallet in the SDK
    private_key = "YOUR_PRIVATE_KEY_HERE"
    wallet = PWRWallet(private_key)

    def set_guardian():
        # Guardian address that will verify your transactions
        guardian = "GUARDIAN_ADDRESS"

        # Guardian validity period - 30 minutes
        current_time = datetime.now()
        future_time = current_time + timedelta(minutes=30) # 30 minutes from now
        expiry_date = int(time.mktime(future_time.timetuple()))

        # Set your wallet guardian
        tx = wallet.set_guardian(guardian, expiry_date)

        # Error handling
        if tx.success:
            print("Transaction Hash:", tx.data)
        else:
            print("Error:", tx.message)
    set_guardian()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::Wallet;
    // chrono = "0.4"
    use chrono::{Duration, Utc};

    async fn set_guardian() {
        // Setting up your wallet in the SDK
        let private_key = "YOUR_PRIVATE_KEY_HERE";
        let wallet = Wallet::from_hex(&private_key).unwrap();

        // Guardian address that will verify your transactions
        let guardian = "GUARDIAN_ADDRESS".to_string();

        // Guardian validity period - 30 minutes
        let current_time = Utc::now();
        let future_time = current_time + Duration::minutes(30); // 30 minutes from now
        let expiry_date = future_time.timestamp() as u64;

        // Set your wallet guardian
        let tx = wallet.set_guardian(guardian, expiry_date).await;

        // Error handling
        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "github.com/pwrlabs/pwrgo/wallet"
        "fmt"
        "time"
    )

    // Add your private key here
    var privateKey = "YOUR_PRIVATE_KEY_HERE"

    func setGuardian() {
        // Setting up your wallet in the SDK
        wallet := wallet.FromPrivateKey(privateKey)

        // Guardian address that will verify your transactions
        guardian := "GUARDIAN_ADDRESS"
        // Guardian validity period - 30 minutes
        futureDate := time.Now().Add(30 * time.Minute) // 30 minutes from now
        expiryDate := int(futureDate.Unix()) // Get the Unix timestamp in seconds

        // Set your wallet guardian
        tx := wallet.SetGuardian(guardian, expiryDate)

        // Error handling
        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;
    using PWR.Models;

    class Program
    {
        static async Task Main()
        {
            // Add your private key here
            string privateKey = "YOUR_PRIVATE_KEY_HERE";
            // Setting up your wallet in the SDK
            var wallet = new PwrWallet(privateKey);
            
            // Guardian address that will verify your transactions
            string guardian = "GUARDIAN_ADDRESS";
            // Guardian validity period - 30 minutes
            DateTime futureDate = DateTime.UtcNow.AddMinutes(30); // 30 minutes from now
            ulong expiryDate = (ulong)((DateTimeOffset)futureDate).ToUnixTimeMilliseconds();

            // Set your wallet guardian
            WalletResponse tx = await wallet.SetGuardian(guardian, expiryDate);

            // Error handling
            if (tx.Success) {
                Console.WriteLine($"Transaction Hash: {tx.TxnHash}");
            } else {
                Console.WriteLine($"Error: {tx.Error}");
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

> **NOTE**: Choose the guardian of your wallet carefully and set an expiration period such as a week or less so that nothing happens to your money if anything happens to the guardian's wallet.

### Remove Guardian

Remove the guardian assigned to the wallet, removing their access or control.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRWallet } = require('@pwrjs/core');

    // Setting up your wallet in the SDK
    const privateKey = "YOUR_PRIVATE_KEY_HERE";
    const wallet = new PWRWallet(privateKey);

    async function removeGuardian() {
        // Remove your wallet guardian
        const tx = await wallet.removeGuardian();

        // Error handling
        if (tx.success) {
            console.log("Transaction Hash:", tx.transactionHash);
        } else {
            console.log("Error:", tx.message);
        }
    }
    removeGuardian()
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrwallet import PWRWallet

    # Setting up your wallet in the SDK
    private_key = "YOUR_PRIVATE_KEY_HERE"
    wallet = PWRWallet(private_key)

    def remove_guardian():
        # Remove your wallet guardian
        tx = wallet.remove_guardian()

        # Error handling
        if tx.success:
            print("Transaction Hash:", tx.data)
        else:
            print("Error:", tx.message)
    remove_guardian()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::Wallet;

    async fn remove_guardian() {
        // Setting up your wallet in the SDK
        let private_key = "YOUR_PRIVATE_KEY_HERE";
        let wallet = Wallet::from_hex(&private_key).unwrap();

        // Remove your wallet guardian
        let tx = wallet.remove_guardian().await;

        // Error handling
        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "github.com/pwrlabs/pwrgo/wallet"
        "fmt"
    )

    // Add your private key here
    var privateKey = "YOUR_PRIVATE_KEY_HERE"

    func removeGuardian() {
        // Setting up your wallet in the SDK
        wallet := wallet.FromPrivateKey(privateKey)

        // Remove your wallet guardian
        tx := wallet.RemoveGuardian()

        // Error handling
        if tx.Success {
            fmt.Printf("Transaction Hash: %s\n", tx.TxHash)
        } else {
            fmt.Println("Error:", tx.Error)
        }
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;
    using PWR.Models;

    class Program
    {
        static async Task Main()
        {
            // Add your private key here
            string privateKey = "YOUR_PRIVATE_KEY_HERE";
            // Setting up your wallet in the SDK
            var wallet = new PwrWallet(privateKey);

            // Remove your wallet guardian
            WalletResponse tx = await wallet.RemoveGuardian();

            // Error handling
            if (tx.Success) {
                Console.WriteLine($"Transaction Hash: {tx.TxnHash}");
            } else {
                Console.WriteLine($"Error: {tx.Error}");
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

## Transaction Fees

When sending transactions, be aware of the transaction fees associated with each transaction type. The PWR Chain charges fees based on the transaction size and the current network conditions. The PWR SDK automatically calculates and includes the necessary fees for you.

Ensure that your wallet has sufficient PWR balance to cover the transaction fees. If the wallet balance is insufficient, the transaction will fail.
