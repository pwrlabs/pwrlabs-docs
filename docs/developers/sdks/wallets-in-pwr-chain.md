---
title: Wallets in PWR Chain
sidebar_position: 2
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Wallets in PWR Chain

In the world of blockchain, a wallet is an essential component that allows you to interact with a blockchain network. It serves as your digital identity and enables you to send and receive transactions, store your assets securely, and interact with decentralized applications (dApps).

When building on the PWR Chain, creating and managing wallets is a fundamental task. The PWR SDK provides a simple and intuitive way to create wallets within your application, abstracting away the complexities of blockchain interactions.

## Why Do You Need a Wallet?

A wallet in the context of blockchain serves several important purposes:

1. **Identity**: Your wallet address acts as your unique identifier on the blockchain network. It's like your account number, allowing you to send and receive transactions.
2. **Asset Storage**: Wallets securely store your digital assets, such as PWR tokens or other tokens built on the PWR Chain. These assets are associated with your wallet address.
3. **Transaction Signing**: Wallets are responsible for signing transactions using your private key. This signature proves that you are the owner of the wallet and authorizes the transaction.
4. **Interaction with dApps**: Wallets allow you to interact with decentralized applications (dApps) built on the PWR Chain. You can connect your wallet to a dApp to perform actions like sending transactions or accessing dApp-specific functionality.

## Creating & Managing Wallets with the SDK

PWR Chain wallets are highly compatible with EVM wallets, allowing you to use the same private key of your wallet to interact with the PWR Chain SDKs.

To create a wallet in your software application using the PWR SDK. You can use your private key on Metamask or use [**PWR Wallet**](https://chromewebstore.google.com/detail/pwr-wallet/kennjipeijpeengjlogfdjkiiadhbmjl) to enjoy all the features.

> **Important:** Don't share or send your wallet's **private key**, so that no one can steal your money.

[Install and import the PWR SDK](/developers/sdks/overview) into your project.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    const { PWRWallet } = require('@pwrjs/core');

    // Create a wallet with a new randomly generated private key
    const randomWallet = new PWRWallet();

    // Create a wallet from an existing private key (String || ByteArray || Int)
    // in this example we will store the private key as a string
    const privateKey = "YOUR_PRIVATE_KEY_HERE";
    const wallet = new PWRWallet(privateKey);
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrwallet import Wallet

    # Create a wallet with a new randomly generated seed phrase
    random_wallet = Wallet.new_random(12)

    # Create a wallet from an existing seed phrase (str)
    # in this example we will store the seed phrase
    seed_phrase = "YOUR_SEED_PHRASE_HERE"
    wallet = Wallet.new(seed_phrase)
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::Wallet;

    fn main() {
        // Create a wallet with a new randomly generated seed phrase
        let random_wallet = Wallet::new_random(12);

        // Create a wallet from an existing seed phrase (str)
        // in this example we will store the seed phrase
        let seed_phrase = "YOUR_SEED_PHRASE_HERE";
        let wallet = Wallet::new(seed_phrase);
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "github.com/pwrlabs/pwrgo/wallet"
    )

    func main() {
        // Create a wallet with a new randomly generated seed phrase
        randomWallet, _ := wallet.NewRandom(12)

        // Create a wallet from an existing seed phrase
        // in this example we will store the seed phrase
        seedPhrase := "YOUR_SEED_PHRASE_HERE"
        wallet, _ := wallet.New(seedPhrase)
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using PWR;

    // Create a wallet with a new randomly generated seed phrase
    var randomWallet = new Wallet(12);

    // Create a wallet from an existing seed phrase
    // in this example we will store the seed phrase
    string seedPhrase = "YOUR_SEED_PHRASE_HERE";
    var wallet = new Wallet(seedPhrase);
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    ```
</TabItem>
</Tabs>

After you have configured your wallet on the project, you can interact with the wallet by fetching data from it or sending transactions.

In this example we will fetch the wallet data:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    // Get the wallet address
    const address = randomWallet.getAddress();
    console.log(`Address: ${address}`);

    // Get the wallet's private key
    const privateKey = randomWallet.getPrivateKey();
    console.log(`PrivateKey: ${privateKey}`);

    // Get the wallet balance
    randomWallet.getBalance()
        .then(balance => console.log(`Balance: ${balance}`));

    // Get the wallet's current nonce
    randomWallet.getNonce()
        .then(nonce => console.log(`Nonce: ${nonce}`));
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    from pwrpy.pwrwallet import Wallet
    random_wallet = Wallet.new_random(12)

    # Get the wallet address
    address = random_wallet.get_address()
    print("Address:", address)

    # Get the wallet's private key
    private_key = random_wallet.get_private_key()
    print("PrivateKey:", private_key)

    # Get the wallet's seed phrase
    seed_phrase = random_wallet.get_seed_phrase()
    print("Seed Phrase:", seed_phrase)

    # Get the wallet balance
    balance = random_wallet.get_balance()
    print("Balance:", balance)

    # Get the wallet's current nonce
    nonce = random_wallet.get_nonce().data
    print("Nonce:", nonce)
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::Wallet;

    #[tokio::main]
    async fn main() {
        // Create a new wallet
        let random_wallet = Wallet::new_random(12);

        // Get the wallet address
        let address = random_wallet.address();
        println!("Address: {address}");

        // Get the wallet's private key
        let private_key = random_wallet.get_private_key();
        println!("PrivateKey: {private_key}");

        // Get the wallet's seed phrase
        let seed_phrase = random_wallet.get_seed_phrase();
        println!("Seed Phrase: {seed_phrase}");

        // Get the wallet balance
        let balance = random_wallet.get_balance().await;
        println!("Balance: {balance}");

        // Get the wallet's current nonce
        let nonce = random_wallet.get_nonce().await;
        println!("Balance: {nonce}");
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    package main

    import (
        "github.com/pwrlabs/pwrgo/wallet"
    )

    func main() {
        // Create a new wallet
        randomWallet, _ := wallet.NewRandom(12)

        // Get the wallet address
        fmt.Println("Address:", randomWallet.GetAddress())

        // Get the wallet's private key
        privateKey := randomWallet.GetPrivateKey()
        fmt.Println("PrivateKey:", privateKey)

        // Get the wallet's seed phrase
        seedPhrase := randomWallet.GetSeedPhrase()
        fmt.Println("Seed Phrase:", seedPhrase)

        // Get the wallet balance
        balance := randomWallet.GetBalance()
        fmt.Println("Balance:", balance)

        // Get the wallet's current nonce
        nonce := randomWallet.GetNonce()
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
            // Create a new wallet
            var randomWallet = new Wallet(12);

            // Get the wallet address
            string address = randomWallet.GetAddress();
            Console.WriteLine($"Address: {address}");

            // Get the wallet's private key
            byte[] privateKey = randomWallet.GetPrivateKey();
            Console.WriteLine($"PrivateKey: {privateKey}");

            // Get the wallet's seed phrase
            string seedPhrase = randomWallet.GetSeedPhrase();
            Console.WriteLine($"Seed Phrase: {seedPhrase}");

            // Get the wallet balance
            ulong balance = await randomWallet.GetBalance();
            Console.WriteLine($"Balance: {balance}");

            // Get the wallet's current nonce
            uint nonce = await randomWallet.GetNonce();
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

We have learned how to run the wallet on the SDK and fetch current data, in the next lesson we will interact with the wallet by sending transactions to the PWR Chain.

## Wallet Security

When creating and managing wallets, security is of utmost importance. Here are a few best practices to keep in mind:

- **Secure Private Key Storage**: Never store private keys in plain text or share them with anyone. Use secure storage mechanisms like encrypted databases or key management systems to protect private keys.
- **User Authentication**: Implement proper user authentication mechanisms to ensure that only authorized users can access their wallets.
- **Backup and Recovery**: Provide mechanisms for users to backup their wallets and recover them in case of loss or device failure. This can include features like mnemonic phrases or private key exporting.
- **Secure Communication**: Ensure that all communication between your application and the PWR Chain is encrypted and secure to prevent unauthorized access or tampering.

By following these security best practices and leveraging the PWR SDK's wallet functionality, you can build secure and user-friendly wallet management within your software application.

Remember, the PWR SDK abstracts away the low-level blockchain interactions, allowing you to focus on building your application's features and user experience. The SDK handles the complexities of wallet creation, transaction signing, and communication with the PWR Chain, making it easier for you to integrate blockchain capabilities into your application.

