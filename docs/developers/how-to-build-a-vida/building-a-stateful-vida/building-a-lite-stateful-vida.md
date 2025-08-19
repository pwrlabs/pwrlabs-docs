---
title: Building a Lite Stateful VIDA
sidebar_position: 2
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Building a Lite Stateful VIDA

A Lite Stateful VIDA is a learning-focused version of a stateful VIDA that demonstrates core concepts without production complexity.

Key Characteristics:

**Stateful** = Remembers data between transactions

```bash
// Each transaction builds on previous state
User A: 1000 tokens → Transfer 100 to User B → User A: 900 tokens
User B: 500 tokens → Receives 100 from User A → User B: 600 tokens
```

**Lite** = Simplified for learning
- In-memory storage (HashMap) instead of databases.
- Single instance instead of distributed validation.
- Simple logging instead of production monitoring.
- Basic error handling instead of complex recovery.

## What Makes It "Stateful"?

Unlike stateless VIDAs that process each transaction independently, stateful VIDAs:

1. Remember Previous Transactions: Each new transaction can depend on what happened before.
2. Maintain Application State: User balances, game scores, inventory levels persist.
3. Process Sequentially: Transactions must be handled in blockchain order.
4. Provide Consistency: All instances of the VIDA reach the same state.

**Lite vs Production Comparison:**

| Feature | Lite VIDA | Production VIDA |
|---------|---------------|---------------------|
| Storage | HashMap (memory) | Merkle Trees |
| Validation | Single instance | Multi-instance consensus |
| Recovery | Restart from scratch | Crash recovery + rollback |
| APIs | None | HTTP REST endpoints |
| Learning Focus | Basic | Advanced |
| Production Ready | ❌ | ✅ |

## Prerequisites to Building a Lite Stateful VIDA

- Good knowledge of the coding language you want to use.
- Completed [Building a Stateless VIDA](../building-a-stateless-vida.md) tutorial.

## Building a Lite Stateful VIDA

In this tutorial we will build a token transfer system.

1. [Import the PWR SDK](../../sdks/overview.md).
2. [Select an ID for Your VIDA](../../sdks/claim-a-vida.md).
3. [Initializing PWR with an RPC Endpoint](../../sdks/read-data-from-pwr-chain.md).
4. [Create and Fund a Wallet](../../../pwrchain/how-to-create-a-browser-wallet.md).

### Define Transaction Data Structure

While PWR Chain stores all transaction data as raw byte arrays, VIDAs can encode this data into structured formats like JSON. Defining a schema for your transactions ensures consistency, simplifies development, and enables collaboration across teams.

**Why Define a Schema?**

- **Consistency**: Ensures all transactions follow a predictable format.
- **Documentation**: Serves as a reference for developers interacting with your VIDA.
- **Validation**: Helps catch malformed data early.

**Example:**

```json
[
    {
        "action": "send-tokens-v1",
        "receiver": "0xC767EA1D613EEFE0CE1610B18CB047881BAFB829",
        "amount": 1000000
    }
]
```

### Setup Hashmap and Transfer Function

The Hash Map will be used to store all balances.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```javascript
    import PWRJS from '@pwrjs/core';

    const VIDA_ID = YOUR_VIDA_ID;
    const START_BLOCK = 350000;
    const RPC_ENDPOINT = "https://pwrrpc.pwrlabs.io/";

    const userTokenBalances = new Map();

    function getBalance(address) {
        address = address.startsWith("0x") ? address : "0x" + address;
        return userTokenBalances.get(address.toLowerCase()) || 0n;
    }

    function setBalance(address, balance) {
        address = address.startsWith("0x") ? address : "0x" + address;
        userTokenBalances.set(address.toLowerCase(), balance);
    }

    function transferTokens(from, to, amount) {
        if (!from || !to || amount <= 0n) {
            console.error(`Invalid transfer parameters: from=${from}, to=${to}, amount=${amount}`);
            return false;
        }

        // Normalize addresses for consistency
        from = from.startsWith("0x") ? from : "0x" + from;
        to = to.startsWith("0x") ? to : "0x" + to;

        const fromBalance = getBalance(from);
        if (fromBalance < amount) {
            console.error(`Insufficient balance for transfer: ${from.toLowerCase()} has ${fromBalance}, trying to transfer ${amount}`);
            return false;
        }

        // Perform the transfer
        setBalance(from, fromBalance - amount);
        const toBalance = getBalance(to);
        setBalance(to, toBalance + amount);
        
        console.log(`New balances - ${from.toLowerCase()}: ${getBalance(from)}, ${to.toLowerCase()}: ${getBalance(to)}`);
        
        return true;
    }
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```python
    from pwrpy.pwrsdk import PWRPY
    import json
    import sys

    VIDA_ID = YOUR_VIDA_ID
    START_BLOCK = 350000
    RPC_ENDPOINT = "https://pwrrpc.pwrlabs.io/"

    user_token_balances = {}

    def get_balance(address):
        address = address if address.startswith("0x") else "0x" + address
        return user_token_balances.get(address.lower(), 0)

    def set_balance(address, balance):
        address = address if address.startswith("0x") else "0x" + address
        user_token_balances[address.lower()] = balance

    def transfer_tokens(from_addr, to_addr, amount):
        if not from_addr or not to_addr or amount <= 0:
            print(f"Invalid transfer parameters: from={from_addr}, to={to_addr}, amount={amount}")
            return False
        
        # Normalize addresses for consistency
        from_addr = from_addr if from_addr.startswith("0x") else "0x" + from_addr
        to_addr = to_addr if to_addr.startswith("0x") else "0x" + to_addr
        
        from_balance = get_balance(from_addr)
        if from_balance < amount:
            print(f"Insufficient balance for transfer: {from_addr.lower()} has {from_balance}, trying to transfer {amount}")
            return False
        
        # Perform the transfer
        set_balance(from_addr, from_balance - amount)
        to_balance = get_balance(to_addr)
        set_balance(to_addr, to_balance + amount)
        
        print(f"New balances - {from_addr.lower()}: {get_balance(from_addr)}, {to_addr.lower()}: {get_balance(to_addr)}")
        
        return True
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    use pwr_rs::RPC;
    use serde_json;
    use std::collections::HashMap;
    use std::sync::{Arc, Mutex};
    use std::sync::OnceLock;

    const VIDA_ID: u64 = YOUR_VIDA_ID;
    const START_BLOCK: u64 = 350000;
    const RPC_ENDPOINT: &str = "https://pwrrpc.pwrlabs.io/";

    static USER_TOKEN_BALANCES: OnceLock<Mutex<HashMap<String, u64>>> = OnceLock::new();

    fn get_balance(address: &str) -> u64 {
        let address = if address.starts_with("0x") {
            address.to_string()
        } else {
            format!("0x{}", address)
        };

        let balances = USER_TOKEN_BALANCES.get_or_init(|| Mutex::new(HashMap::new()));
        let balances = balances.lock().unwrap();
        *balances.get(&address.to_lowercase()).unwrap_or(&0)
    }

    fn set_balance(address: &str, balance: u64) {
        let address = if address.starts_with("0x") {
            address.to_string()
        } else {
            format!("0x{}", address)
        };

        let balances = USER_TOKEN_BALANCES.get_or_init(|| Mutex::new(HashMap::new()));
        let mut balances = balances.lock().unwrap();
        balances.insert(address.to_lowercase(), balance);
    }

    fn transfer_tokens(from_addr: &str, to_addr: &str, amount: u64) -> bool {
        if from_addr.is_empty() || to_addr.is_empty() || amount == 0 {
            println!("Invalid transfer parameters: from={}, to={}, amount={}", from_addr, to_addr, amount);
            return false;
        }

        let from_addr = if from_addr.starts_with("0x") {
            from_addr.to_string()
        } else {
            format!("0x{}", from_addr)
        };

        let to_addr = if to_addr.starts_with("0x") {
            to_addr.to_string()
        } else {
            format!("0x{}", to_addr)
        };

        let from_balance = get_balance(&from_addr);
        if from_balance < amount {
            println!("Insufficient balance for transfer: {} has {}, trying to transfer {}", from_addr.to_lowercase(), from_balance, amount);
            return false;
        }

        // Perform the transfer
        set_balance(&from_addr, from_balance - amount);
        let to_balance = get_balance(&to_addr);
        set_balance(&to_addr, to_balance + amount);

        println!("New balances - {}: {}, {}: {}", 
            from_addr.to_lowercase(), get_balance(&from_addr),
            to_addr.to_lowercase(), get_balance(&to_addr)
        );

        true
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
        "os/signal"
        "strconv"
        "strings"
        "sync"
        "syscall"

        "github.com/pwrlabs/pwrgo/rpc"
    )

    const (
        VIDA_ID      = 123
        START_BLOCK  = 350000
        RPC_ENDPOINT = "https://pwrrpc.pwrlabs.io/"
    )

    // Global balance storage like in JavaScript and Python
    var userTokenBalances = make(map[string]int64)
    var balancesMutex sync.RWMutex

    func getBalance(address string) int64 {
        if !strings.HasPrefix(address, "0x") {
            address = "0x" + address
        }
        address = strings.ToLower(address)

        balancesMutex.RLock()
        defer balancesMutex.RUnlock()

        balance, exists := userTokenBalances[address]
        if !exists {
            return 0
        }
        return balance
    }

    func setBalance(address string, balance int64) {
        if !strings.HasPrefix(address, "0x") {
            address = "0x" + address
        }
        address = strings.ToLower(address)

        balancesMutex.Lock()
        defer balancesMutex.Unlock()

        userTokenBalances[address] = balance
    }

    func transferTokens(fromAddr, toAddr string, amount int64) bool {
        if fromAddr == "" || toAddr == "" || amount <= 0 {
            fmt.Printf("Invalid transfer parameters: from=%s, to=%s, amount=%d\n", fromAddr, toAddr, amount)
            return false
        }

        if !strings.HasPrefix(fromAddr, "0x") {
            fromAddr = "0x" + fromAddr
        }
        if !strings.HasPrefix(toAddr, "0x") {
            toAddr = "0x" + toAddr
        }

        fromBalance := getBalance(fromAddr)
        if fromBalance < amount {
            fmt.Printf("Insufficient balance for transfer: %s has %d, trying to transfer %d\n",
                strings.ToLower(fromAddr), fromBalance, amount)
            return false
        }

        // Perform the transfer
        setBalance(fromAddr, fromBalance-amount)
        toBalance := getBalance(toAddr)
        setBalance(toAddr, toBalance+amount)

        fmt.Printf("New balances - %s: %d, %s: %d\n",
            strings.ToLower(fromAddr), getBalance(fromAddr),
            strings.ToLower(toAddr), getBalance(toAddr))

        return true
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    using System;
    using System.Collections.Generic;
    using System.Numerics;
    using System.Text;
    using System.Text.Json;
    using System.Threading;
    using System.Threading.Tasks;
    using PWR;
    using PWR.Models;

    namespace LiteStatefulVida;

    class Index
    {
        // Constants
        private const ulong VIDA_ID = 123;
        private const ulong START_BLOCK = 350000;
        private const string RPC_ENDPOINT = "https://pwrrpc.pwrlabs.io/";

        // Global balance storage like in JavaScript and Python
        private static readonly Dictionary<string, BigInteger> userTokenBalances = new();
        private static readonly object balancesLock = new();

        private static BigInteger GetBalance(string address)
        {
            if (!address.StartsWith("0x"))
                address = "0x" + address;
            address = address.ToLower();

            lock (balancesLock)
            {
                return userTokenBalances.TryGetValue(address, out var balance) ? balance : 0;
            }
        }

        private static void SetBalance(string address, BigInteger balance)
        {
            if (!address.StartsWith("0x"))
                address = "0x" + address;
            address = address.ToLower();

            lock (balancesLock)
            {
                userTokenBalances[address] = balance;
            }
        }

        private static bool TransferTokens(string fromAddr, string toAddr, BigInteger amount)
        {
            if (string.IsNullOrEmpty(fromAddr) || string.IsNullOrEmpty(toAddr) || amount <= 0)
            {
                Console.WriteLine($"Invalid transfer parameters: from={fromAddr}, to={toAddr}, amount={amount}");
                return false;
            }

            if (!fromAddr.StartsWith("0x"))
                fromAddr = "0x" + fromAddr;
            if (!toAddr.StartsWith("0x"))
                toAddr = "0x" + toAddr;

            var fromBalance = GetBalance(fromAddr);
            if (fromBalance < amount)
            {
                Console.WriteLine($"Insufficient balance for transfer: {fromAddr.ToLower()} has {fromBalance}, trying to transfer {amount}");
                return false;
            }

            // Perform the transfer
            SetBalance(fromAddr, fromBalance - amount);
            var toBalance = GetBalance(toAddr);
            SetBalance(toAddr, toBalance + amount);

            Console.WriteLine($"New balances - {fromAddr.ToLower()}: {GetBalance(fromAddr)}, {toAddr.ToLower()}: {GetBalance(toAddr)}");

            return true;
        }
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    private static Map<String /*Address*/, Long /*Balance*/> userTokenBalances = new HashMap<>();
    
    private static boolean transferTokens(String from, String to, long amount) {
        if (from == null || to == null || amount <= 0) {
            System.err.println("Invalid transfer parameters: from=" + from + ", to=" + to + ", amount=" + amount);
            return false;
        }
        
        // Normalize addresses to lowercase for consistency
        from = from.toLowerCase();
        to = to.toLowerCase();

        Long fromBalance = userTokenBalances.get(from);
        if (fromBalance == null || fromBalance < amount) {
            System.err.println("Insufficient balance for transfer: " + from + " has " + fromBalance + ", trying to transfer " + amount);
            return false;
        }

        userTokenBalances.put(from, fromBalance - amount);
        userTokenBalances.put(to, userTokenBalances.getOrDefault(to, 0L) + amount);
        System.out.println("Transfer successful: " + amount + " tokens from " + from + " to " + to);

        return true;
    }
    ```
</TabItem>
</Tabs>

### Define a Starting Block

**Stateful VIDAs** must define a starting block because they need to build up their state by processing every relevant transaction in order. Without knowing where to start, they can't guarantee their state is correct.

**Best Practice:** Set your starting block to the latest PWR Chain block at the time of your VIDA's development or launch, since previous blocks won't contain any transactions for your VIDA (it didn't exist yet).

You can find the current latest block at: [https://explorer.pwrlabs.io/](https://explorer.pwrlabs.io/).

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```javascript
    const START_BLOCK = 350000;
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```python
    START_BLOCK = 350000
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    const START_BLOCK: u64 = 350000;
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    const START_BLOCK = 350000
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    private const ulong START_BLOCK = 350000;
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    private static final long START_BLOCK = 350000;
    ```
</TabItem>
</Tabs>

### Set Initial Balances

Since we're creating a token VIDA, some addresses must have tokens when the VIDA launches. Without initial balances, no one would have tokens to transfer, making the system unusable.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```javascript
    function setupInitialBalances() {
        setBalance("0xc767ea1d613eefe0ce1610b18cb047881bafb829", 1_000_000_000_000n);
        setBalance("0x3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4", 1_000_000_000_000n);
    }
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```python
    def setup_initial_balances():
        set_balance("0xc767ea1d613eefe0ce1610b18cb047881bafb829", 1_000_000_000_000)
        set_balance("0x3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4", 1_000_000_000_000)
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    fn setup_initial_balances() {
        set_balance("0xc767ea1d613eefe0ce1610b18cb047881bafb829", 1_000_000_000_000);
        set_balance("0x3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4", 1_000_000_000_000);
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    func setupInitialBalances() {
        setBalance("0xc767ea1d613eefe0ce1610b18cb047881bafb829", 1_000_000_000_000)
        setBalance("0x3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4", 1_000_000_000_000)
    }    
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
        private static void SetupInitialBalances()
        {
            SetBalance("0xc767ea1d613eefe0ce1610b18cb047881bafb829", new BigInteger(1_000_000_000_000));
            SetBalance("0x3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4", new BigInteger(1_000_000_000_000));
        }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    userTokenBalances.put("0xc767ea1d613eefe0ce1610b18cb047881bafb829".toLowerCase(), 1_000_000_000_000L); //Replace the address with your address or any desired address
    userTokenBalances.put("0x3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4".toLowerCase(), 1_000_000_000_000L);
    ```
</TabItem>
</Tabs>

### Read Data from PWR Chain & Handle it

**Stateful VIDAs** need to read data from PWR Chain to update their state. This is done by subscribing to the VIDA's transactions and handling them accordingly.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```javascript
    function processTransaction(transaction) {
        try {
            const from = (transaction.sender).startsWith("0x") ? transaction.sender : "0x" + transaction.sender;
            const data = transaction.data;

            // Parse transaction data as JSON
            let jsonData;
            try {
                // Convert hex data to string and parse JSON
                const dataBytes = Buffer.from(data, 'hex');
                const dataString = dataBytes.toString('utf8');
                jsonData = JSON.parse(dataString);
            } catch (parseError) {
                console.error(`Failed to parse transaction data: ${parseError.message}`);
                return;
            }

            const action = jsonData.action || "";
            
            if (action === "send-tokens-v1") {
                const amount = BigInt(jsonData.amount || 0);
                const receiver = jsonData.receiver.startsWith("0x") ? jsonData.receiver : "0x" + jsonData.receiver;
                
                console.log(`Transfer request: ${amount} tokens from ${from.toLowerCase()} to ${receiver.toLowerCase()}`);
                
                if (transferTokens(from, receiver, amount)) {
                    console.log(`✅ Transaction processed successfully`);
                } else {
                    console.error(`❌ Failed to process transaction`);
                }
            } else {
                console.log(`Unknown action: ${action}`);
            }
            
        } catch (error) {
            console.error(`Error processing transaction: ${error.message}`);
        }
    }

    async function main() {
        console.log("🚀 Starting PWR Chain Lite Stateful VIDA - Token Transfer System");

        try {
            // Initialize PWR Chain connection
            const pwrjs = new PWRJS(RPC_ENDPOINT);

            setupInitialBalances();
            
            const subscription = pwrjs.subscribeToVidaTransactions(
                BigInt(VIDA_ID),
                BigInt(START_BLOCK),
                processTransaction
            );

            console.log("\n⏳ Application running... Press Ctrl+C to stop");
            
            process.on('SIGINT', () => {
                console.log('\n🛑 Shutting down gracefully...');
                subscription.stop();
                console.log('✅ Subscription stopped');
                process.exit(0);
            });
        } catch (error) {
            console.error(`❌ Application error: ${error.message}`);
            console.error(error.stack);
            process.exit(1);
        }
    }
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```python
    def process_transaction(transaction):
        try:
            from_addr = transaction.sender if transaction.sender.startswith("0x") else "0x" + transaction.sender
            data = transaction.data
            
            # Parse transaction data as JSON
            try:
                # Convert hex data to string and parse JSON
                data_bytes = bytes.fromhex(data)
                data_string = data_bytes.decode('utf-8')
                json_data = json.loads(data_string)
            except Exception as parse_error:
                print(f"Failed to parse transaction data: {parse_error}")
                return
            
            action = json_data.get("action", "")
            
            if action == "send-tokens-v1":
                amount = int(json_data.get("amount", 0))
                receiver = json_data["receiver"] if json_data["receiver"].startswith("0x") else "0x" + json_data["receiver"]
                
                print(f"Transfer request: {amount} tokens from {from_addr.lower()} to {receiver.lower()}")
                
                if transfer_tokens(from_addr, receiver, amount):
                    print("✅ Transaction processed successfully")
                else:
                    print("❌ Failed to process transaction")
            else:
                print(f"Unknown action: {action}")
                
        except Exception as error:
            print(f"Error processing transaction: {error}")

    def main():
        print("🚀 Starting PWR Chain Lite Stateful VIDA - Token Transfer System")
        
        try:
            # Initialize PWR Chain connection
            pwrpy = PWRPY(RPC_ENDPOINT)
            
            setup_initial_balances()
            
            pwrpy.subscribe_to_vida_transactions(VIDA_ID, START_BLOCK, process_transaction)
            
            print("\n⏳ Application running... Press Ctrl+C to stop")
                
        except Exception as error:
            print(f"❌ Application error: {error}")
            sys.exit(1)
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    fn process_transaction(transaction: pwr_rs::transaction::types::VidaDataTransaction) {
        let from_addr = if transaction.sender.starts_with("0x") {
            transaction.sender.clone()
        } else {
            format!("0x{}", transaction.sender)
        };

        let data = transaction.data;

        // Parse transaction data as JSON
        let data_string = match String::from_utf8(data) {
            Ok(s) => s,
            Err(e) => {
                println!("Failed to parse transaction data: {}", e);
                return;
            }
        };

        let json_data: serde_json::Value = match serde_json::from_str(&data_string) {
            Ok(data) => data,
            Err(e) => {
                println!("Failed to parse transaction data: {}", e);
                return;
            }
        };
        
        let action = json_data.get("action").and_then(|v| v.as_str()).unwrap_or("");
        
        if action == "send-tokens-v1" {
            let amount = json_data.get("amount")
                .and_then(|v| v.as_str())
                .and_then(|s| s.parse::<u64>().ok())
                .unwrap_or(0);
                
            let receiver = json_data.get("receiver")
                .and_then(|v| v.as_str())
                .unwrap_or("");
                
            let receiver = if receiver.starts_with("0x") {
                receiver.to_string()
            } else {
                format!("0x{}", receiver)
            };


            println!("Transfer request: {} tokens from {} to {}", amount, from_addr.to_lowercase(), receiver.to_lowercase());

            if transfer_tokens(&from_addr, &receiver, amount) {
                println!("✅ Transaction processed successfully");
            } else {
                println!("❌ Failed to process transaction");
            }
        } else {
            println!("Unknown action: {}", action);
        }
    }

    pub async fn main() -> Result<(), Box<dyn std::error::Error>> {
        println!("🚀 Starting PWR Chain Lite Stateful VIDA - Token Transfer System");

        let rpc = RPC::new(RPC_ENDPOINT).await.unwrap();
        let rpc = Arc::new(rpc);

        setup_initial_balances();

        rpc.subscribe_to_vida_transactions(VIDA_ID, START_BLOCK, process_transaction, None);

        println!("\n⏳ Application running... Press Ctrl+C to stop");

        // To exit the program ctrl+c
        tokio::signal::ctrl_c().await?;
        println!("\n🛑 Shutting down gracefully...");
        println!("✅ Subscription stopped");

        Ok(())
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    func processTransaction(transaction rpc.VidaDataTransaction) {
        fromAddr := transaction.Sender
        if !strings.HasPrefix(fromAddr, "0x") {
            fromAddr = "0x" + fromAddr
        }

        data := transaction.Data

        // Parse transaction data as JSON
        dataBytes, err := hex.DecodeString(data)
        if err != nil {
            fmt.Printf("Failed to decode hex data: %v\n", err)
            return
        }

        dataString := string(dataBytes)
        var jsonData map[string]interface{}
        err = json.Unmarshal([]byte(dataString), &jsonData)
        if err != nil {
            fmt.Printf("Failed to parse transaction data: %v\n", err)
            return
        }

        action, exists := jsonData["action"].(string)
        if !exists {
            action = ""
        }

        if action == "send-tokens-v1" {
            amountStr, exists := jsonData["amount"].(string)
            if !exists {
                fmt.Println("Amount not found in transaction data")
                return
            }

            amount, err := strconv.ParseInt(amountStr, 10, 64)
            if err != nil {
                fmt.Printf("Failed to parse amount: %v\n", err)
                return
            }

            receiver, exists := jsonData["receiver"].(string)
            if !exists {
                fmt.Println("Receiver not found in transaction data")
                return
            }

            if !strings.HasPrefix(receiver, "0x") {
                receiver = "0x" + receiver
            }

            fmt.Printf("Transfer request: %d tokens from %s to %s\n",
                amount, strings.ToLower(fromAddr), strings.ToLower(receiver))

            if transferTokens(fromAddr, receiver, amount) {
                fmt.Println("✅ Transaction processed successfully")
            } else {
                fmt.Println("❌ Failed to process transaction")
            }
        } else {
            fmt.Printf("Unknown action: %s\n", action)
        }
    }

    func main() {
        fmt.Println("🚀 Starting PWR Chain Lite Stateful VIDA - Token Transfer System")

        // Initialize PWR Chain connection
        rpcClient := rpc.SetRpcNodeUrl(RPC_ENDPOINT)

        setupInitialBalances()

        // Subscribe to VIDA transactions
        subscription := rpcClient.SubscribeToVidaTransactions(VIDA_ID, START_BLOCK, processTransaction)

        fmt.Println("\n⏳ Application running... Press Ctrl+C to stop")

        // Set up signal handling for graceful shutdown
        c := make(chan os.Signal, 1)
        signal.Notify(c, os.Interrupt, syscall.SIGTERM)
        <-c
        fmt.Println("\n🛑 Shutting down gracefully...")
        if subscription != nil {
            fmt.Println("✅ Subscription stopped")
        }
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
        private static void ProcessTransaction(VidaDataTransaction transaction)
        {
            try
            {
                var fromAddr = transaction.Sender.StartsWith("0x") ? transaction.Sender : "0x" + transaction.Sender;
                var data = transaction.Data;

                // Parse transaction data as JSON
                string dataString;
                try
                {
                    // Convert hex data to string and parse JSON
                    var dataBytes = Convert.FromHexString(data);
                    dataString = Encoding.UTF8.GetString(dataBytes);
                }
                catch (Exception parseError)
                {
                    Console.WriteLine($"Failed to parse transaction data: {parseError.Message}");
                    return;
                }

                JsonDocument jsonData;
                try
                {
                    jsonData = JsonDocument.Parse(dataString);
                }
                catch (Exception jsonError)
                {
                    Console.WriteLine($"Failed to parse JSON data: {jsonError.Message}");
                    return;
                }

                using (jsonData)
                {
                    var action = jsonData.RootElement.TryGetProperty("action", out var actionElement) 
                        ? actionElement.GetString() ?? "" 
                        : "";

                    if (action == "send-tokens-v1")
                    {
                        var amountStr = jsonData.RootElement.TryGetProperty("amount", out var amountElement) 
                            ? amountElement.GetString() ?? "0" 
                            : "0";

                        if (!BigInteger.TryParse(amountStr, out var amount))
                        {
                            Console.WriteLine($"Failed to parse amount: {amountStr}");
                            return;
                        }

                        var receiver = jsonData.RootElement.TryGetProperty("receiver", out var receiverElement) 
                            ? receiverElement.GetString() ?? "" 
                            : "";

                        if (!receiver.StartsWith("0x"))
                            receiver = "0x" + receiver;

                        Console.WriteLine($"Transfer request: {amount} tokens from {fromAddr.ToLower()} to {receiver.ToLower()}");

                        if (TransferTokens(fromAddr, receiver, amount))
                        {
                            Console.WriteLine("✅ Transaction processed successfully");
                        }
                        else
                        {
                            Console.WriteLine("❌ Failed to process transaction");
                        }
                    }
                    else
                    {
                        Console.WriteLine($"Unknown action: {action}");
                    }
                }
            }
            catch (Exception error)
            {
                Console.WriteLine($"Error processing transaction: {error.Message}");
            }
        }

        public static async Task Main()
        {
            Console.WriteLine("🚀 Starting PWR Chain Lite Stateful VIDA - Token Transfer System");

            try
            {
                // Initialize PWR Chain connection
                var pwr = new RPC(RPC_ENDPOINT);

                SetupInitialBalances();

                // Subscribe to VIDA transactions
                var subscription = pwr.SubscribeToVidaTransactions(VIDA_ID, START_BLOCK, ProcessTransaction);

                Console.WriteLine("\n⏳ Application running... Press Ctrl+C to stop");

                // Set up cancellation token for graceful shutdown
                using var cts = new CancellationTokenSource();
                Console.CancelKeyPress += (sender, e) =>
                {
                    e.Cancel = true;
                    cts.Cancel();
                };

                try
                {
                    await Task.Delay(Timeout.Infinite, cts.Token);
                }
                catch (OperationCanceledException)
                {
                    Console.WriteLine("\n🛑 Shutting down gracefully...");
                    subscription?.Stop();
                    Console.WriteLine("✅ Subscription stopped");
                }
            }
            catch (Exception error)
            {
                Console.WriteLine($"❌ Application error: {error.Message}");
                Environment.Exit(1);
            }
        }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    private static void readAndHandleData(PWRJ pwrj, long vidaId, long startingBlock) throws IOException {
        pwrj.subscribeToVidaTransactions(pwrj, vidaId, startingBlock, null, (transaction) -> {
            String from = transaction.getSender();
            String to = transaction.getReceiver();
            byte[] data = transaction.getData();
            
            // Normalize addresses to ensure they start with "0x" because the RPC might return them without it
            if(!from.startsWith("0x")) from = "0x" + from;
            if(!to.startsWith("0x")) to = "0x" + to;

            JSONObject jsonData = new JSONObject(new String(data));
            String action = jsonData.optString("action", "");
            
            if(action.equalsIgnoreCase("transfer")) {
                long amount = jsonData.optLong("amount", 0);
                
                if (transferTokens(from, to, amount)) {
                    System.out.println("Transaction processed: " + from + " transferred " + amount + " tokens to " + to);
                } else {
                    System.err.println("Failed to process transaction: " + from + " -> " + to + " for amount: " + amount);
                }
            }
        });
    }
    ```
</TabItem>
</Tabs>

### Send Transactions

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```javascript
    async function sendTransfer(wallet, receiver, amount) {
        try {
            const normalizedReceiver = receiver.toLowerCase();

            const transferData = {
                action: "send-tokens-v1",
                receiver: normalizedReceiver,
                amount: amount.toString()
            };

            // Convert to bytes
            const dataString = JSON.stringify(transferData);
            const data = new TextEncoder().encode(dataString);

            // Send transaction to PWR Chain
            const response = await wallet.sendPayableVidaData(BigInt(123), data, 0n);
            
            if (response.success) {
                console.log(`✅ Transaction sent successfully!`);
                console.log(`Transaction hash: ${response.hash}`);
                return true;
            } else {
                console.error(`❌ Failed to send transaction: ${response.message}`);
                return false;
            }
        } catch (error) {
            console.error(`Error sending transfer: ${error.message}`);
            return false;
        }
    }
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```python
    async def send_transfer(wallet, receiver, amount):
        try:
            normalized_receiver = receiver.lower()
            
            transfer_data = {
                "action": "send-tokens-v1",
                "receiver": normalized_receiver,
                "amount": str(amount)
            }
            
            # Convert to bytes
            data_string = json.dumps(transfer_data)
            data = data_string.encode('utf-8')
            
            # Send transaction to PWR Chain
            response = wallet.send_payable_vida_data(123, data, 0)
            
            if response.success:
                print("✅ Transaction sent successfully!")
                print(f"Transaction hash: {response.hash.hex()}")
                return True
            else:
                print(f"❌ Failed to send transaction: {response.error}")
                return False
        except Exception as error:
            print(f"Error sending transfer: {error}")
            return False
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    pub async fn send_transfer(wallet: &Wallet, receiver: &str, amount: u64) -> Result<bool, Box<dyn std::error::Error>> {
        let normalized_receiver = receiver.to_lowercase();
        
        let transfer_data = json!({
            "action": "send-tokens-v1",
            "receiver": normalized_receiver,
            "amount": amount.to_string()
        });
        
        // Convert to bytes
        let data_string = transfer_data.to_string();
        let data = data_string.as_bytes().to_vec();
        
        let fee_per_byte = 1000;
        
        // Send transaction to PWR Chain
        let response = wallet.send_payable_vida_data(123, data, 0, fee_per_byte).await;
        
        if response.success {
            println!("✅ Transaction sent successfully!");
            if let Some(hash) = response.data {
                println!("Transaction hash: {:?}", hash);
            }
            Ok(true)
        } else {
            println!("❌ Failed to send transaction: {:?}", response.error);
            Ok(false)
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    func SendTransfer(wallet *wallet.PWRWallet, receiver string, amount int64) bool {
        normalizedReceiver := strings.ToLower(receiver)

        transferData := map[string]interface{}{
            "action":   "send-tokens-v1",
            "receiver": normalizedReceiver,
            "amount":   fmt.Sprintf("%d", amount),
        }

        // Convert to bytes
        dataBytes, err := json.Marshal(transferData)
        if err != nil {
            fmt.Printf("Error marshaling transfer data: %v\n", err)
            return false
        }
        feePerByte := 1000

        response := wallet.SendPayableVidaData(123, dataBytes, 0, feePerByte)

        if response.Success {
            fmt.Println("✅ Transaction sent successfully!")
            fmt.Printf("Transaction hash: %s\n", response.Hash)
            return true
        } else {
            fmt.Printf("❌ Failed to send transaction: %v\n", response.Error)
            return false
        }
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    public static async Task<bool> SendTransfer(Wallet wallet, string receiver, BigInteger amount)
    {
        try
        {
            var normalizedReceiver = receiver.ToLower();

            var transferData = new
            {
                action = "send-tokens-v1",
                receiver = normalizedReceiver,
                amount = amount.ToString()
            };

            // Convert to bytes
            var dataString = JsonSerializer.Serialize(transferData);
            var dataBytes = Encoding.UTF8.GetBytes(dataString);

            // Get fee per byte
            var feePerByte = await wallet.GetRpc().GetFeePerByte();

            // Send transaction to PWR Chain
            var response = await wallet.SendPayableVidaData(123, dataBytes, 0, feePerByte);

            if (response.Success)
            {
                Console.WriteLine("✅ Transaction sent successfully!");
                Console.WriteLine($"Transaction hash: {response.Hash}");
                return true;
            }
            else
            {
                Console.WriteLine($"❌ Failed to send transaction: {response.Error}");
                return false;
            }
        }
        catch (Exception error)
        {
            Console.WriteLine($"Error sending transfer: {error.Message}");
            return false;
        }
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    private static boolean transferTokens(PWRFalconWallet wallet, String receiver, long amount) throws IOException {
        String senderAddress = wallet.getAddress().toLowerCase();
        long senderBalance = getBalance(senderAddress);

        if (senderBalance < amount) {
            System.err.println("Insufficient balance for transfer: " + senderAddress + " has " + senderBalance + ", trying to transfer " + amount);
            return false;
        }

        // Normalize receiver address to ensure it starts with "0x"
        if(!receiver.startsWith("0x")) {
            receiver = "0x" + receiver; // Ensure the address starts with "0x"
        }

        JSONObject transferData = new JSONObject();
        transferData.put("action", "send-tokens-v1");
        transferData.put("receiver", receiver);
        transferData.put("amount", amount);

        byte[] data = transferData.toString().getBytes();

        Response response = wallet.submitPayableVidaData(VIDA_ID, data, 0, pwrj.getFeePerByte());
        if (!response.isSuccess()) {
            System.err.println("Failed to transfer tokens: " + response.getError());
            return false;
        }

        return true;
    }
    ```
</TabItem>
</Tabs>

## Final Notes & Best Practices

When building a Lite Stateful VIDA, your primary goal is to maintain the benefits of a stateful design—verifiable consistency, auditability, and resilience—while minimizing complexity and overhead. By storing only essential state, validating transactions from a known checkpoint, and leveraging PWR Chain’s immutable ledger, you can achieve strong guarantees without excessive resource usage.
