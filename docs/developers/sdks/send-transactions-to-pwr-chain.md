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

<!-- <img src="/img/faucet.png" /> -->

## PWR Chain Transactions

To send transactions to PWR Chain, all what you need's setup the PWR SDK in your project and create wallet as we did in the previous lessons, and check the address balance so that you have enough gas fees.

Types of PWR Chain transactions - there are many types of PWR SDKs, in this guide we will focus on the following:

- [**`Transfer PWR`**](#transfer-pwr): Transfers PWR tokens from one wallet to another, facilitating token movement within the network.
- [**`Send VM Data`**](#send-vm-data): Sends data to a specific virtual machine for storage and processing purposes.
- [**`Send Payable VM Data`**](#send-payable-vm-data): Sends data to a specific virtual machine (VM ID) and transfers PWR tokens to the VM as part of the operation.
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
        const txHash = await wallet.transferPWR(recipientAddress, amount);
        
        // Error handling
        if (txHash.success) {
            console.log("Transaction Hash:", txHash.transactionHash);
        } else {
            console.log("Error:", txHash.message);
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
        tx_hash = wallet.transfer_pwr(recipient_address, amount)

        # Error handling
        if tx_hash.success:
            print("Transaction Hash:", tx_hash.data)
        else:
            print("Error:", tx_hash.message)
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
        let tx_hash = wallet.transfer_pwr(recipient_address, amount).await;

        println!("Transaction Hash: {tx_hash}");
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
        recipientAddress := "0x3B3b69093879e7B6F28366Fa3c32762590Ff547e"
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
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
</Tabs>

### Send VM Data

Sends data to a specific virtual machine for storage and processing purposes.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRWallet } = require('@pwrjs/core');

    // Setting up your wallet in the SDK
    const privateKey = "YOUR_PRIVATE_KEY_HERE";
    const wallet = new PWRWallet(privateKey);

    async function sendData() {
        // VM id used to send the transaction to
        const vmId = 123;
        // Buffer data to be included in the transaction
        const data = Buffer.from('Hello World!');
        
        // Send the data at vmID 123 to the chain
        const txHash = await wallet.sendVMDataTxn(vmId, data);

        // Error handling
        if (txHash.success) {
            console.log("Transaction Hash:", txHash.transactionHash);
        } else {
            console.log("Error:", txHash.message);
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
        # VM id used to send the transaction to
        vm_id = 123
        # Buffer data to be included in the transaction
        data = "Hello World!".encode()

        # Send the data at vmID 123 to the chain
        tx_hash = wallet.send_vm_data_transaction(vm_id, data)

        # Error handling
        if tx_hash.success:
            print("Transaction Hash:", tx_hash.data)
        else:
            print("Error:", tx_hash.message)
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

        // VM id used to send the transaction to
        let vm_id = 123;
        // Buffer data to be included in the transaction
        let data = vec!["Hello World!"];
        let data_as_bytes: Vec<u8> = data.into_iter().flat_map(|s| s.as_bytes().to_vec()).collect();

        // Send the data at vmID 123 to the chain
        let tx_hash = wallet.send_vm_data(vm_id, data_as_bytes).await;

        println!("Transaction Hash: {tx_hash}");
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
        // VM id used to send the transaction to
        vmId := 123
        // Buffer data to be included in the transaction
        data := []byte("Hello world")

        // Send the data at vmID 123 to the chain
        tx := wallet.SendVMData(vmId, data)

        // Error handling
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

You must have wondered, why doesn’t the VM ID work specifically to suit my needs and the rules I want? It seems random? Of course not, we will explain this in the next guide on [**Claim a VM ID**](/developers/sdks/claim-a-vm-id). KEEP DIVING IN.

### Send Payable VM Data

Sends data to a specific virtual machine (VM ID) and transfers PWR tokens to the VM as part of the operation.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRWallet } = require('@pwrjs/core');

    // Setting up your wallet in the SDK
    const privateKey = "YOUR_PRIVATE_KEY_HERE";
    const wallet = new PWRWallet(privateKey);

    async function sendPayableData() {
        // VM id used to send the transaction to
        const vmId = 919;
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        const amount = 1000;
        // Buffer data to be included in the transaction
        const data = Buffer.from('Hello World!');
        
        // Send the data at vmID 919 and pay 1e3
        const txHash = await wallet.sendPayableVmDataTransaction(vmId, amount, data);

        // Error handling
        if (txHash.success) {
            console.log("Transaction Hash:", txHash.transactionHash);
        } else {
            console.log("Error:", txHash.message);
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
        # VM id used to send the transaction to
        vm_id = 919
        # Tokens amount - 1 PWR = 1e9 = 1000000000
        amount = 1000
        # Buffer data to be included in the transaction
        data = "Hello World!".encode()

        # Send the data at vmID 919 and pay 1e3
        tx_hash = wallet.send_payable_vm_data_transaction(vm_id, amount, data)

        # Error handling
        if tx_hash.success:
            print("Transaction Hash:", tx_hash.data)
        else:
            print("Error:", tx_hash.message)
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

        // VM id used to send the transaction to
        let vm_id = 919;
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        let amount = 1000;
        // Buffer data to be included in the transaction
        let data = vec!["Hello World!"];
        let data_as_bytes: Vec<u8> = data.into_iter().flat_map(|s| s.as_bytes().to_vec()).collect();

        // Send the data at vmID 919 and pay 1e3
        let tx_hash = wallet.send_payable_vm_data(vm_id, amount, data_as_bytes).await;

        println!("Transaction Hash: {tx_hash}");
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
        // VM id used to send the transaction to
        vmId := 919
        // Tokens amount - 1 PWR = 1e9 = 1000000000
        amount := 10
        // Buffer data to be included in the transaction
        data := []byte("Hello world")

        // Send the data at vmID 919 and pay 1e3
        tx := wallet.SendPayableVMData(vmId, amount, data)

        // Error handling
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
        const txHash = await wallet.delegate(validator, amount);

        // Error handling
        if (txHash.success) {
            console.log("Transaction Hash:", txHash.transactionHash);
        } else {
            console.log("Error:", txHash.message);
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
        tx_hash = wallet.delegate(validator, amount)

        # Error handling
        if tx_hash.success:
            print("Transaction Hash:", tx_hash.data)
        else:
            print("Error:", tx_hash.message)
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
        let tx_hash = wallet.delegate(validator, amount).await;

        println!("Transaction Hash: {tx_hash}");
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
        const txHash = await wallet.withdraw(validator, amount);

        // Error handling
        if (txHash.success) {
            console.log("Transaction Hash:", txHash.transactionHash);
        } else {
            console.log("Error:", txHash.message);
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
        tx_hash = wallet.withdraw(validator, amount)

        # Error handling
        if tx_hash.success:
            print("Transaction Hash:", tx_hash.data)
        else:
            print("Error:", tx_hash.message)
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
        let tx_hash = wallet.withdraw(validator, amount).await;

        println!("Transaction Hash: {tx_hash}");
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
        const txHash = await wallet.moveStake(amount, fromValidator, toValidator);

        // Error handling
        if (txHash.success) {
            console.log("Transaction Hash:", txHash.transactionHash);
        } else {
            console.log("Error:", txHash.message);
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
        tx_hash = wallet.move_stake(amount, from_validator, to_validator)

        # Error handling
        if tx_hash.success:
            print("Transaction Hash:", tx_hash.data)
        else:
            print("Error:", tx_hash.message)
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
        let tx_hash = wallet.move_stake(amount, from_validator, to_validator).await;

        println!("Transaction Hash: {tx_hash}");
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
        const txHash = await wallet.setGuardian(guardian, expiryDate);

        // Error handling
        if (txHash.success) {
            console.log("Transaction Hash:", txHash.transactionHash);
        } else {
            console.log("Error:", txHash.message);
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
        tx_hash = wallet.set_guardian(guardian, expiry_date)

        # Error handling
        if tx_hash.success:
            print("Transaction Hash:", tx_hash.data)
        else:
            print("Error:", tx_hash.message)
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
        let tx_hash = wallet.set_guardian(guardian, expiry_date).await;

        println!("Transaction Hash: {tx_hash}");
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
        guardian := "0x34bfe9c609ca72d5a4661889033a221fa07ef61a"
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
        const txHash = await wallet.removeGuardian();

        // Error handling
        if (txHash.success) {
            console.log("Transaction Hash:", txHash.transactionHash);
        } else {
            console.log("Error:", txHash.message);
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
        tx_hash = wallet.remove_guardian()

        # Error handling
        if tx_hash.success:
            print("Transaction Hash:", tx_hash.data)
        else:
            print("Error:", tx_hash.message)
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
        let tx_hash = wallet.remove_guardian().await;

        println!("Transaction Hash: {tx_hash}");
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
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
</Tabs>

## Transaction Fees

When sending transactions, be aware of the transaction fees associated with each transaction type. The PWR Chain charges fees based on the transaction size and the current network conditions. The PWR SDK automatically calculates and includes the necessary fees for you.

Ensure that your wallet has sufficient PWR balance to cover the transaction fees. If the wallet balance is insufficient, the transaction will fail.
