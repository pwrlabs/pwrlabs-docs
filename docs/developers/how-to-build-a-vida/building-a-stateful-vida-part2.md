---
title: Building a Stateful VIDA - Part 2
sidebar_position: 6
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Building a Stateful VIDA - Part 2

In Part 1, we established the foundational components of our stateful VIDA: project setup, database layer with MerkleTree integration, and HTTP API for peer communication. Now we'll implement the core transaction processing logic, orchestrate the main application, and demonstrate how to run the complete system.

## Continuing the Build Process

### 4. Transaction Processing

Implement the core application that subscribes to VIDA transactions and processes them while maintaining state consistency.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    // handler.js
    import PWRJS from "@pwrjs/core";
    import fetch from 'node-fetch';
    import DatabaseService from './databaseService.js';

    const VIDA_ID = 73746238;
    const RPC_URL = "https://pwrrpc.pwrlabs.io/";
    const REQUEST_TIMEOUT = 10000;

    export let peersToCheckRootHashWith = [];
    let pwrjsClient = null;
    let subscription = null;

    // Fetches the root hash from a peer node for the specified block number
    async function fetchPeerRootHash(peer, blockNumber) {
        const url = `http://${peer}/rootHash?blockNumber=${blockNumber}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                timeout: REQUEST_TIMEOUT,
                headers: {
                    'Accept': 'text/plain'
                }
            });
            
            if (response.ok) {
                const hexString = await response.text();
                const trimmed = hexString.trim();
                
                if (!trimmed) {
                    console.log(`Peer ${peer} returned empty root hash for block ${blockNumber}`);
                    return { success: false, rootHash: null };
                }
                
                try {
                    const rootHash = Buffer.from(trimmed, 'hex');
                    console.log(`Successfully fetched root hash from peer ${peer} for block ${blockNumber}`);
                    return { success: true, rootHash };
                } catch (error) {
                    console.log(`Invalid hex response from peer ${peer} for block ${blockNumber}`);
                    return { success: false, rootHash: null };
                }
            } else {
                console.log(`Peer ${peer} returned HTTP ${response.status} for block ${blockNumber}`);
                return { success: true, rootHash: null };
            }
        } catch (error) {
            console.log(`Failed to fetch root hash from peer ${peer} for block ${blockNumber}`);
            return { success: false, rootHash: null };
        }
    }

    // Validates the local Merkle root against peers and persists it if a quorum of peers agree
    async function checkRootHashValidityAndSave(blockNumber) {
        const localRoot = await DatabaseService.getRootHash();
        
        if (!localRoot) {
            console.log(`No local root hash available for block ${blockNumber}`);
            return;
        }
        
        let peersCount = peersToCheckRootHashWith.length;
        let quorum = Math.floor((peersCount * 2) / 3) + 1;
        let matches = 0;
        
        for (const peer of peersToCheckRootHashWith) {
            const { success, rootHash } = await fetchPeerRootHash(peer, blockNumber);
            
            if (success && rootHash) {
                if (localRoot.equals(rootHash)) {
                    matches++;
                }
            } else {
                if (peersCount > 0) {
                    peersCount--;
                    quorum = Math.floor((peersCount * 2) / 3) + 1;
                }
            }
            
            if (matches >= quorum) {
                await DatabaseService.setBlockRootHash(blockNumber, localRoot);
                console.log(`Root hash validated and saved for block ${blockNumber}`);
                return;
            }
        }
        
        console.log(`Root hash mismatch: only ${matches}/${peersToCheckRootHashWith.length} peers agreed`);
        await DatabaseService.revertUnsavedChanges();
        subscription.setLatestCheckedBlock(BigInt(await DatabaseService.getLastCheckedBlock()));
    }

    // Executes a token transfer described by the given JSON payload
    async function handleTransfer(jsonData, senderHex) {
        const amount = BigInt(jsonData.amount || 0);
        const receiverHex = jsonData.receiver || "";
        
        if (amount <= 0 || !receiverHex) {
            console.log("Skipping invalid transfer:", jsonData);
            return;
        }

        const senderAddress = senderHex.startsWith("0x") ? senderHex.slice(2) : senderHex;
        const receiverAddress = receiverHex.startsWith("0x") ? receiverHex.slice(2) : receiverHex;
        
        const sender = Buffer.from(senderAddress, 'hex');
        const receiver = Buffer.from(receiverAddress, 'hex');
        
        const success = await DatabaseService.transfer(sender, receiver, amount);
        
        if (success) {
            console.log(`Transfer succeeded: ${amount} from ${senderHex} to ${receiverHex}`);
        } else {
            console.log(`Transfer failed (insufficient funds): ${amount} from ${senderHex} to ${receiverHex}`);
        }
    }

    // Processes a single VIDA transaction
    function processTransaction(txn) {    
        try {
            const dataBytes = Buffer.from(txn.data, 'hex');
        
            const dataStr = dataBytes.toString('utf8');
            const jsonData = JSON.parse(dataStr);
            
            const action = jsonData.action || "";
            
            if (action.toLowerCase() === "transfer") {
                handleTransfer(jsonData, txn.sender);
            }
        } catch (error) {
            console.error("Error processing transaction:", txn.hash, error);
        }
    }

    // Callback invoked as blocks are processed
    async function onChainProgress(blockNumber) {
        try {
            await DatabaseService.setLastCheckedBlock(blockNumber);
            await checkRootHashValidityAndSave(blockNumber);
            console.log(`Checkpoint updated to block ${blockNumber}`);
            await DatabaseService.flush();
        } catch (error) {
            console.error("Failed to update last checked block:", blockNumber, error);
        } finally {
            return null;
        }
    }

    // Subscribes to VIDA transactions starting from the given block
    export async function subscribeAndSync(fromBlock) {
        console.log(`Starting VIDA transaction subscription from block ${fromBlock}`);

        // Initialize RPC client
        pwrjsClient = new PWRJS(RPC_URL);
        
        // Subscribe to VIDA transactions
        subscription = pwrjsClient.subscribeToVidaTransactions(
            VIDA_ID,
            BigInt(fromBlock),
            processTransaction,
            onChainProgress
        );
        console.log(`Successfully subscribed to VIDA ${VIDA_ID} transactions`);
    }
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    # handler.py
    import json
    import requests
    from pwrpy.pwrsdk import PWRPY
    from database_service import DatabaseService

    VIDA_ID = 73_746_238
    RPC_URL = "https://pwrrpc.pwrlabs.io/"
    REQUEST_TIMEOUT = 10

    pwrpy_client = None
    subscription = None
    peers_to_check_root_hash_with = []

    # Fetches the root hash from a peer node for the specified block number
    def fetch_peer_root_hash(peer, block_number):
        url = f"http://{peer}/rootHash?blockNumber={block_number}"
            
        try:
            response = requests.get(url, timeout=REQUEST_TIMEOUT, headers={'Accept': 'text/plain'})
            
            if response.status_code == 200:
                hex_string = response.text.strip()
                
                if not hex_string:
                    print(f"Peer {peer} returned empty root hash for block {block_number}")
                    return False, None
                
                try:
                    root_hash = bytes.fromhex(hex_string)
                    print(f"Successfully fetched root hash from peer {peer} for block {block_number}")
                    return True, root_hash
                except ValueError:
                    print(f"Invalid hex response from peer {peer} for block {block_number}")
                    return False, None
            else:
                print(f"Peer {peer} returned HTTP {response.status_code} for block {block_number}")
                return True, None
                
        except Exception:
            print(f"Failed to fetch root hash from peer {peer} for block {block_number}")
            return False, None

    # Validates the local Merkle root against peers and persists it if a quorum of peers agree
    def check_root_hash_validity_and_save(block_number):
        local_root = DatabaseService.get_root_hash()
        
        if not local_root:
            print(f"No local root hash available for block {block_number}")
            return
        
        peers_count = len(peers_to_check_root_hash_with)
        quorum = (peers_count * 2) // 3 + 1
        matches = 0
        
        for peer in peers_to_check_root_hash_with:
            success, root_hash = fetch_peer_root_hash(peer, block_number)
            
            if success and root_hash:
                if root_hash == local_root:
                    matches += 1
            else:
                if peers_count > 0:
                    peers_count -= 1
                    quorum = (peers_count * 2) // 3 + 1
            
            if matches >= quorum:
                DatabaseService.set_block_root_hash(block_number, local_root)
                print(f"Root hash validated and saved for block {block_number}")
                return
        
        print(f"Root hash mismatch: only {matches}/{len(peers_to_check_root_hash_with)} peers agreed")
        DatabaseService.revert_unsaved_changes()
        subscription.set_latest_checked_block(DatabaseService.get_last_checked_block())

    # Executes a token transfer described by the given JSON payload
    def handle_transfer(json_data, sender_hex):
        try:
            amount = int(json_data.get('amount', 0))
            receiver_hex = json_data.get('receiver', '')
            
            if amount <= 0 or not receiver_hex:
                print(f"Invalid transfer data: {json_data}")
                return

            sender_address = sender_hex[2:] if sender_hex.startswith('0x') else sender_hex
            receiver_address = receiver_hex[2:] if receiver_hex.startswith('0x') else receiver_hex

            sender = bytes.fromhex(sender_address)
            receiver = bytes.fromhex(receiver_address)
            
            success = DatabaseService.transfer(sender, receiver, amount)
            
            if success:
                print(f"Transfer succeeded: {amount} from {sender_hex} to {receiver_hex}")
            else:
                print(f"Transfer failed (insufficient funds): {amount} from {sender_hex} to {receiver_hex}")
                
        except Exception as e:
            print(f"Error handling transfer: {e}")

    # Processes a single VIDA transaction
    def process_transaction(txn):
        try:
            data_hex = txn.data
            data_bytes = bytes.fromhex(data_hex)
            
            data_str = data_bytes.decode('utf-8')
            json_data = json.loads(data_str)
            
            action = json_data.get('action', '')
            
            if action.lower() == 'transfer':
                handle_transfer(json_data, txn.sender)
                
        except Exception as e:
            print(f"Error processing transaction: {e}")

    # Callback invoked as blocks are processed
    def on_chain_progress(block_number):
        DatabaseService.set_last_checked_block(block_number)
        check_root_hash_validity_and_save(block_number)
        print(f"Checkpoint updated to block {block_number}")
        DatabaseService.flush()

    # Subscribes to VIDA transactions starting from the given block
    def subscribe_and_sync(from_block):
        global pwrpy_client, subscription
        
        print(f"Starting VIDA transaction subscription from block {from_block}")
        
        pwrpy_client = PWRPY(RPC_URL)
        
        subscription = pwrpy_client.subscribe_to_vida_transactions(
            VIDA_ID,
            from_block,
            process_transaction,
            on_chain_progress
        )
        
        print(f"Successfully subscribed to VIDA {VIDA_ID} transactions")
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    // src/handler.rs
    use pwr_rs::{
        RPC,
        transaction::types::VidaDataTransaction,
        rpc::types::{VidaTransactionSubscription, block_saver},
    };
    use std::sync::Arc;
    use std::time::Duration;
    use hex;
    use serde_json::{Value, Map};
    use num_bigint::BigUint;

    use crate::database_service::DatabaseService;

    // Constants
    const VIDA_ID: u64 = 73_746_238;
    const RPC_URL: &str = "https://pwrrpc.pwrlabs.io/";

    // Global state
    #[allow(non_upper_case_globals)]
    static mut subscription: Option<VidaTransactionSubscription> = None;

    pub static mut PEERS_TO_CHECK_ROOT_HASH_WITH: Vec<String> = Vec::new();

    // Fetches the root hash from a peer node for the specified block number
    async fn fetch_peer_root_hash(
        client: &reqwest::Client,
        peer: &str, 
        block_number: u64
    ) -> (bool, Option<Vec<u8>>) {
        let url = format!("http://{}/rootHash?blockNumber={}", peer, block_number);
        
        match client.get(&url)
            .header("Accept", "text/plain")
            .send()
            .await
        {
            Ok(response) => {
                if response.status().is_success() {
                    match response.text().await {
                        Ok(hex_string) => {
                            let trimmed = hex_string.trim();
                            if trimmed.is_empty() {
                                println!("Peer {} returned empty root hash for block {}", peer, block_number);
                                (false, None)
                            } else {
                                match hex::decode(trimmed) {
                                    Ok(root_hash) => {
                                        println!("Successfully fetched root hash from peer {} for block {}", peer, block_number);
                                        (true, Some(root_hash))
                                    }
                                    Err(_) => {
                                        println!("Invalid hex response from peer {} for block {}", peer, block_number);
                                        (false, None)
                                    }
                                }
                            }
                        }
                        Err(_) => {
                            println!("Failed to read response from peer {} for block {}", peer, block_number);
                            (false, None)
                        }
                    }
                } else {
                    println!("Peer {} returned HTTP {} for block {}", peer, response.status(), block_number);
                    (true, None)
                }
            }
            Err(_) => {
                println!("Failed to fetch root hash from peer {} for block {}", peer, block_number);
                (false, None)
            }
        }
    }

    // Validates the local Merkle root against peers and persists it if a quorum of peers agree
    async fn check_root_hash_validity_and_save(block_number: u64) {
        let local_root = match DatabaseService::get_root_hash() {
            Ok(Some(root)) => root,
            _ => {
                println!("No local root hash available for block {}", block_number);
                return;
            }
        };
        
        let peers = unsafe { &PEERS_TO_CHECK_ROOT_HASH_WITH };
        let mut peers_count = peers.len();
        let mut quorum = (peers_count * 2) / 3 + 1;
        let mut matches = 0;
        
        // Create HTTP client
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(10))
            .build()
            .unwrap();
        
        for peer in peers {
            let (success, peer_root) = fetch_peer_root_hash(&client, peer, block_number).await;
            
            if success && peer_root.is_some() {
                if peer_root.unwrap() == local_root {
                    matches += 1;
                }
            } else {
                if peers_count > 0 {
                    peers_count -= 1;
                    quorum = (peers_count * 2) / 3 + 1;
                }
            }
            
            if matches >= quorum {
                DatabaseService::set_block_root_hash(block_number, &local_root).unwrap();
                println!("Root hash validated and saved for block {}", block_number);
                return;
            }
        }
        
        println!("Root hash mismatch: only {}/{} peers agreed", matches, peers.len());
        
        // Revert changes and reset block to reprocess the data
        DatabaseService::revert_unsaved_changes().unwrap();
        unsafe {
            subscription.as_ref().unwrap().set_latest_checked_block(
                DatabaseService::get_last_checked_block().unwrap() as u64
            );
        }
    }

    // Executes a token transfer described by the given JSON payload
    fn handle_transfer(json_data: &Map<String, Value>, sender_hex: &str) {
        // Extract amount and receiver from JSON
        let amount = match json_data.get("amount")
            .and_then(|val| {
                if let Some(s) = val.as_str() {
                    s.parse::<BigUint>().ok()
                } else if let Some(n) = val.as_u64() {
                    Some(BigUint::from(n))
                } else {
                    None
                }
            }) {
            Some(amt) => amt,
            None => {
                println!("Invalid or missing amount");
                return;
            }
        };
        
        let receiver_hex = match json_data.get("receiver")
            .and_then(|val| val.as_str()) {
            Some(r) => r,
            None => {
                println!("Missing receiver");
                return;
            }
        };
        
        // Decode hex addresses
        let sender_address = if sender_hex.starts_with("0x") { &sender_hex[2..] } else { sender_hex };
        let receiver_address = if receiver_hex.starts_with("0x") { &receiver_hex[2..] } else { receiver_hex };

        let sender = hex::decode(sender_address).unwrap_or_default();
        let receiver = hex::decode(receiver_address).unwrap_or_default();
        
        // Execute transfer
        match DatabaseService::transfer(&sender, &receiver, &amount) {
            Ok(true) => {
                println!("Transfer succeeded: {} from {} to {}", amount, sender_hex, receiver_hex);
            }
            Ok(false) => {
                println!("Transfer failed (insufficient funds): {} from {} to {}", amount, sender_hex, receiver_hex);
            }
            Err(_) => {
                println!("Transfer operation failed");
            }
        }
    }

    // Processes a single VIDA transaction
    fn process_transaction(txn: VidaDataTransaction) {
        let data_bytes = txn.data;
        
        // Parse JSON data
        let data_str = match String::from_utf8(data_bytes) {
            Ok(s) => s,
            Err(_) => {
                println!("Error decoding transaction data");
                return;
            }
        };
        
        let json_data: Value = match serde_json::from_str(&data_str) {
            Ok(json) => json,
            Err(_) => {
                println!("Error parsing transaction JSON");
                return;
            }
        };
        
        if let Some(obj_map) = json_data.as_object() {
            let action = obj_map.get("action")
                .and_then(|val| val.as_str())
                .unwrap_or("");
            
            if action.to_lowercase() == "transfer" {
                handle_transfer(obj_map, &txn.sender);
            }
        }
    }

    // Callback invoked as blocks are processed
    async fn on_chain_progress(block_number: u64) {
        DatabaseService::set_last_checked_block(block_number).unwrap();
        check_root_hash_validity_and_save(block_number).await;
        println!("Checkpoint updated to block {}", block_number);
        DatabaseService::flush().map_err(|e| format!("Failed to flush database: {:?}", e)).unwrap();
    }

    // Subscribes to VIDA transactions starting from the given block
    pub async fn subscribe_and_sync(from_block: u64) -> Result<(), Box<dyn std::error::Error>> {
        println!("Starting VIDA transaction subscription from block {}", from_block);
        
        // Initialize RPC client
        let rpc = RPC::new(RPC_URL).await.map_err(|e| format!("Failed to create RPC client: {:?}", e))?;
        let rpc = Arc::new(rpc);
        
        let block_saver = block_saver::from_async(on_chain_progress);
        // Subscribe to VIDA transactions
        unsafe {
            subscription = Some(rpc.subscribe_to_vida_transactions(
                VIDA_ID,
                from_block,
                process_transaction,
                Some(block_saver)
            ));
        }
        
        println!("Successfully subscribed to VIDA {} transactions", VIDA_ID);
        Ok(())
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    // handler.go
    package main

    import (
        "encoding/hex"
        "encoding/json"
        "fmt"
        "io"
        "math/big"
        "net/http"
        "strings"
        "time"

        "pwr-stateful-vida/dbservice"
        "github.com/pwrlabs/pwrgo/rpc"
    )

    var subscription *rpc.VidaTransactionSubscription
    var peersToCheckRootHashWith []string

    // fetchPeerRootHash fetches the root hash from a peer node for the specified block number
    func fetchPeerRootHash(peer string, blockNumber int) (bool, []byte) {
        url := fmt.Sprintf("http://%s/rootHash?blockNumber=%d", peer, blockNumber)

        client := &http.Client{Timeout: 10 * time.Second}
        resp, err := client.Get(url)
        if err != nil {
            fmt.Printf("Failed to fetch root hash from peer %s for block %d\n", peer, blockNumber)
            return false, nil
        }
        defer resp.Body.Close()

        if resp.StatusCode == 200 {
            body, _ := io.ReadAll(resp.Body)
            hexString := strings.TrimSpace(string(body))

            if hexString == "" {
                fmt.Printf("Peer %s returned empty root hash for block %d\n", peer, blockNumber)
                return false, nil
            }

            rootHash, err := hex.DecodeString(hexString)
            if err != nil {
                fmt.Printf("Invalid hex response from peer %s for block %d\n", peer, blockNumber)
                return false, nil
            }

            fmt.Printf("Successfully fetched root hash from peer %s for block %d\n", peer, blockNumber)
            return true, rootHash
        } else {
            fmt.Printf("Peer %s returned HTTP %d for block %d\n", peer, resp.StatusCode, blockNumber)
            return true, nil
        }
    }

    // checkRootHashValidityAndSave validates the local Merkle root against peers and persists it if a quorum of peers agree
    func checkRootHashValidityAndSave(blockNumber int) {
        localRoot, _ := dbservice.GetRootHash()
        if localRoot == nil {
            fmt.Printf("No local root hash available for block %d\n", blockNumber)
            return
        }

        peersCount := len(peersToCheckRootHashWith)
        quorum := (peersCount*2)/3 + 1
        matches := 0

        for _, peer := range peersToCheckRootHashWith {
            success, peerRoot := fetchPeerRootHash(peer, blockNumber)

            if success && peerRoot != nil {
                if string(peerRoot) == string(localRoot) {
                    matches++
                }
            } else {
                peersCount--
                quorum = (peersCount*2)/3 + 1
            }

            if matches >= quorum {
                dbservice.SetBlockRootHash(blockNumber, localRoot)
                fmt.Printf("Root hash validated and saved for block %d\n", blockNumber)
                return
            }
        }

        fmt.Printf("Root hash mismatch: only %d/%d peers agreed\n", matches, len(peersToCheckRootHashWith))

        // Revert changes and reset block to reprocess the data
        dbservice.RevertUnsavedChanges()
        lastCheckedBlock, _ := dbservice.GetLastCheckedBlock()
        subscription.SetLatestCheckedBlock(int(lastCheckedBlock))
    }

    // handleTransfer executes a token transfer described by the given JSON payload
    func handleTransfer(jsonData map[string]interface{}, senderHex string) {
        // Extract amount and receiver from JSON
        amountRaw := jsonData["amount"]
        receiverHex, _ := jsonData["receiver"].(string)

        if amountRaw == nil || receiverHex == "" {
            fmt.Printf("Skipping invalid transfer: %v\n", jsonData)
            return
        }

        // Convert amount to big.Int
        var amount *big.Int
        switch v := amountRaw.(type) {
        case string:
            amount, _ = new(big.Int).SetString(v, 10)
        case float64:
            amount = big.NewInt(int64(v))
        default:
            fmt.Printf("Invalid amount type: %v\n", jsonData)
            return
        }

        // Decode hex addresses
        senderAddress := strings.TrimPrefix(senderHex, "0x")
        receiverAddress := strings.TrimPrefix(receiverHex, "0x")

        sender, _ := hex.DecodeString(senderAddress)
        receiver, _ := hex.DecodeString(receiverAddress)

        // Execute transfer
        success, _ := dbservice.Transfer(sender, receiver, amount)

        if success {
            fmt.Printf("Transfer succeeded: %s from %s to %s\n", amount, senderHex, receiverHex)
        } else {
            fmt.Printf("Transfer failed (insufficient funds): %s from %s to %s\n", amount, senderHex, receiverHex)
        }
    }

    // processTransaction processes a single VIDA transaction
    func processTransaction(transaction rpc.VidaDataTransaction) {
        // Get transaction data and convert from hex to bytes
        dataBytes, _ := hex.DecodeString(transaction.Data)

        // Parse JSON data
        var jsonData map[string]interface{}
        json.Unmarshal(dataBytes, &jsonData)

        // Get action from JSON
        action, _ := jsonData["action"].(string)

        if strings.ToLower(action) == "transfer" {
            handleTransfer(jsonData, transaction.Sender)
        }
    }

    // onChainProgress callback invoked as blocks are processed
    func onChainProgress(blockNumber int) error {
        dbservice.SetLastCheckedBlock(blockNumber)
        checkRootHashValidityAndSave(blockNumber)
        fmt.Printf("Checkpoint updated to block %d\n", blockNumber)
        dbservice.Flush()

        return nil
    }

    // subscribeAndSync subscribes to VIDA transactions starting from the given block
    func subscribeAndSync(fromBlock int) {
        fmt.Printf("Starting VIDA transaction subscription from block %d\n", fromBlock)

        // Initialize RPC client
        rpcClient := rpc.SetRpcNodeUrl(RPC_URL)

        subscription = rpcClient.SubscribeToVidaTransactions(
            VIDA_ID,
            fromBlock,
            processTransaction,
            onChainProgress,
        )

        fmt.Printf("Successfully subscribed to VIDA %d transactions\n", VIDA_ID)
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    // Handler.cs
    using System;
    using System.Numerics;
    using System.Text;
    using System.Threading.Tasks;
    using Newtonsoft.Json.Linq;
    using PWR;
    using PWR.Models;
    using PWR.Utils;

    namespace PwrStatefulVIDA;

    public class Handler
    {
        // Constants
        private const ulong VIDA_ID = 73746238;
        private const string RPC_URL = "https://pwrrpc.pwrlabs.io/";

        private static RPC? pwrClient;
        private static VidaTransactionSubscription? subscription;
        // Global state
        public static List<string> peersToCheckRootHashWith = new();

        private static async Task<(bool success, byte[]? rootHash)> FetchPeerRootHash(
            HttpClient client, string peer, ulong blockNumber)
        {
            var url = $"http://{peer}/rootHash?blockNumber={blockNumber}";

            try
            {
                var response = await client.GetAsync(url);

                if (response.IsSuccessStatusCode)
                {
                    var hexString = await response.Content.ReadAsStringAsync();
                    var trimmed = hexString.Trim();

                    if (string.IsNullOrEmpty(trimmed))
                    {
                        Console.WriteLine($"Peer {peer} returned empty root hash for block {blockNumber}");
                        return (false, null);
                    }

                    try
                    {
                        var rootHash = PWR.Utils.Extensions.HexStringToByteArray(trimmed);
                        Console.WriteLine($"Successfully fetched root hash from peer {peer} for block {blockNumber}");
                        return (true, rootHash);
                    }
                    catch (Exception)
                    {
                        Console.WriteLine($"Invalid hex response from peer {peer} for block {blockNumber}");
                        return (false, null);
                    }
                }
                else
                {
                    Console.WriteLine($"Peer {peer} returned HTTP {response.StatusCode} for block {blockNumber}");
                    return (true, null);
                }
            }
            catch (Exception)
            {
                Console.WriteLine($"Failed to fetch root hash from peer {peer} for block {blockNumber}");
                return (false, null);
            }
        }

        private static async Task CheckRootHashValidityAndSave(ulong blockNumber)
        {
            var localRoot = DatabaseService.GetRootHash();

            if (localRoot == null)
            {
                Console.WriteLine($"No local root hash available for block {blockNumber}");
                return;
            }

            int peersCount = peersToCheckRootHashWith.Count;
            int quorum = (peersCount * 2) / 3 + 1;
            int matches = 0;

            using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(10) };

            foreach (var peer in peersToCheckRootHashWith)
            {
                var (success, peerRoot) = await FetchPeerRootHash(httpClient, peer, blockNumber);

                if (success && peerRoot != null)
                {
                    if (localRoot.SequenceEqual(peerRoot))
                    {
                        matches++;
                    }
                }
                else
                {
                    if (peersCount > 0)
                    {
                        peersCount--;
                        quorum = (peersCount * 2) / 3 + 1;
                    }
                }

                if (matches >= quorum)
                {
                    DatabaseService.SetBlockRootHash(blockNumber, localRoot);
                    Console.WriteLine($"Root hash validated and saved for block {blockNumber}");
                    return;
                }
            }

            Console.WriteLine($"Root hash mismatch: only {matches}/{peersToCheckRootHashWith.Count} peers agreed");
            DatabaseService.RevertUnsavedChanges();
            subscription.SetLatestCheckedBlock(DatabaseService.GetLastCheckedBlock());
        }

        private static void HandleTransfer(JObject jsonData, string senderHex)
        {
            var amountToken = jsonData["amount"];
            BigInteger amount;

            if (amountToken?.Type == JTokenType.String)
            {
                amount = BigInteger.Parse(amountToken.ToString());
            }
            else if (amountToken?.Type == JTokenType.Integer)
            {
                amount = new BigInteger((long)amountToken);
            }
            else
            {
                Console.WriteLine("Invalid or missing amount");
                return;
            }

            var receiverHex = jsonData["receiver"]?.ToString();
            if (string.IsNullOrEmpty(receiverHex))
            {
                Console.WriteLine("Missing receiver");
                return;
            }

            var senderAddress = senderHex.StartsWith("0x") ? senderHex[2..] : senderHex;
            var receiverAddress = receiverHex.StartsWith("0x") ? receiverHex[2..] : receiverHex;

            var sender = PWR.Utils.Extensions.HexStringToByteArray(senderAddress);
            var receiver = PWR.Utils.Extensions.HexStringToByteArray(receiverAddress);

            var success = DatabaseService.Transfer(sender, receiver, amount);

            if (success)
            {
                Console.WriteLine($"Transfer succeeded: {amount} from {senderHex} to {receiverHex}");
            }
            else
            {
                Console.WriteLine($"Transfer failed (insufficient funds): {amount} from {senderHex} to {receiverHex}");
            }
        }

        private static void ProcessTransaction(VidaDataTransaction txn)
        {
            try
            {
                var dataBytes = PWR.Utils.Extensions.HexStringToByteArray(txn.Data);
                var dataStr = Encoding.UTF8.GetString(dataBytes);
                var jsonData = JObject.Parse(dataStr);

                var action = jsonData["action"]?.ToString() ?? "";

                if (action.Equals("transfer", StringComparison.OrdinalIgnoreCase))
                {
                    HandleTransfer(jsonData, txn.Sender);
                }
            }
            catch (Exception error)
            {
                Console.WriteLine($"Error processing transaction: {error.Message}");
            }
        }

        private static async Task OnChainProgress(ulong blockNumber)
        {
            DatabaseService.SetLastCheckedBlock(blockNumber);
            await CheckRootHashValidityAndSave(blockNumber);
            Console.WriteLine($"Checkpoint updated to block {blockNumber}");
            DatabaseService.Flush();
        }

        public static async Task SubscribeAndSync(ulong fromBlock)
        {
            Console.WriteLine($"Starting VIDA transaction subscription from block {fromBlock}");

            pwrClient = new RPC(RPC_URL);

            subscription = pwrClient.SubscribeToVidaTransactions(
                VIDA_ID,
                fromBlock,
                ProcessTransaction,
                OnChainProgress
            );
            Console.WriteLine($"Successfully subscribed to VIDA {VIDA_ID} transactions");
        }

    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    // Handler.java
    package main;

    import com.github.pwrlabs.pwrj.entities.FalconTransaction;
    import com.github.pwrlabs.pwrj.protocol.PWRJ;
    import com.github.pwrlabs.pwrj.protocol.VidaTransactionSubscription;
    import io.pwrlabs.util.encoders.BiResult;
    import org.bouncycastle.util.encoders.Hex;
    import org.json.JSONObject;
    import org.rocksdb.RocksDBException;

    import java.io.IOException;
    import java.math.BigInteger;
    import java.net.URI;
    import java.net.http.HttpClient;
    import java.net.http.HttpRequest;
    import java.net.http.HttpResponse;
    import java.nio.charset.StandardCharsets;
    import java.time.Duration;
    import java.util.Arrays;
    import java.util.logging.Level;
    import java.util.logging.Logger;


    public class Handler {
        private static final Logger LOGGER = Logger.getLogger(Main.class.getName());
        private static final long VIDA_ID = 73_746_238L;
        private static final PWRJ PWRJ_CLIENT = new PWRJ("https://pwrrpc.pwrlabs.io/");
        private static VidaTransactionSubscription subscription;
        private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();
        private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(10);

        /**
        * Fetches the root hash from a peer node for the specified block number.
        *
        * @param peer the peer hostname/address
        * @param blockNumber the block number to query
        * @return BiResult where first element indicates successful connection, second element contains the root hash bytes
        */
        private static BiResult<Boolean /*Replied*/, byte[]> fetchPeerRootHash(String peer, long blockNumber) {
            try {
                // Build the URL for the peer's rootHash endpoint
                String url = "http://" + peer + "/rootHash?blockNumber=" + blockNumber;

                // Create the HTTP request
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .GET()
                        .timeout(REQUEST_TIMEOUT)
                        .header("Accept", "text/plain")
                        .build();

                // Send the request and get response
                HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

                // Check if the response was successful
                if (response.statusCode() == 200) {
                    String hexString = response.body().trim();

                    // Validate that we received a non-empty hex string
                    if (hexString.isEmpty()) {
                        LOGGER.warning("Peer " + peer + " returned empty root hash for block " + blockNumber);
                        return new BiResult<>(false, new byte[0]);
                    }

                    // Decode the hex string to bytes
                    byte[] rootHash = Hex.decode(hexString);

                    LOGGER.fine("Successfully fetched root hash from peer " + peer + " for block " + blockNumber);
                    return new BiResult<>(true, rootHash);

                } else {
                    LOGGER.warning("Peer " + peer + " returned HTTP " + response.statusCode() +
                            " for block " + blockNumber + ": " + response.body());
                    return new BiResult<>(true, new byte[0]);
                }

            } catch (IllegalArgumentException e) {
                LOGGER.warning("Invalid hex response from peer " + peer + " for block " + blockNumber + ": " + e.getMessage());
                return new BiResult<>(false, new byte[0]);
            } catch (Exception e) {
                LOGGER.log(Level.WARNING, "Failed to fetch root hash from peer " + peer + " for block " + blockNumber, e);
                return new BiResult<>(false, new byte[0]);
            }
        }

        /**
        * Validates the local Merkle root against peers and persists it if a quorum
        * of peers agree.
        *
        * @param blockNumber block height being validated
        */
        private static void checkRootHashValidityAndSave(long blockNumber) {
            try {
                byte[] localRoot = DatabaseService.getRootHash();
                int peersCount = Main.peersToCheckRootHashWith.size();
                long quorum = (peersCount * 2) / 3 + 1;
                int matches = 0;
                for (String peer : Main.peersToCheckRootHashWith) {
                    // TODO: fetch peer root via RPC and compare
                    BiResult<Boolean /**/, byte[]> response = fetchPeerRootHash(peer, blockNumber);
                    if(response.getFirst()) {
                        if(Arrays.equals(response.getSecond(), localRoot)) {
                            matches++;
                        }
                    } else {
                        --peersCount;
                        quorum = (peersCount * 2) / 3 + 1;
                    }

                    if (matches >= quorum) {
                        DatabaseService.setBlockRootHash(blockNumber, localRoot);
                        LOGGER.info("Root hash validated and saved for block " + blockNumber);
                        return;
                    }
                }

                LOGGER.severe("Root hash mismatch: only " + matches + "/" + Main.peersToCheckRootHashWith.size());
                //Revert changes and reset block to reprocess the data
                DatabaseService.revertUnsavedChanges();
                subscription.setLatestCheckedBlock(DatabaseService.getLastCheckedBlock());
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "Error verifying root hash at block " + blockNumber, e);
            }
        }

        /**
        * Executes a token transfer described by the given JSON payload.
        *
        * @param json       transfer description
        * @param senderHex  hexadecimal sender address
        * @throws RocksDBException if balance updates fail
        */
        private static void handleTransfer(JSONObject json, String senderHex) throws RocksDBException {
            BigInteger amount = json.optBigInteger("amount", null);
            String receiverHex = json.optString("receiver", null);
            if (amount == null || receiverHex == null) {
                LOGGER.warning("Skipping invalid transfer: " + json);
                return;
            }

            String senderAddress = senderHex.startsWith("0x") ? senderHex.substring(2) : senderHex;
            String receiverAddress = receiverHex.startsWith("0x") ? receiverHex.substring(2) : receiverHex;

            byte[] sender = Hex.decode(senderAddress);
            byte[] receiver = Hex.decode(receiverAddress);

            boolean success = DatabaseService.transfer(sender, receiver, amount);
            if (success) {
                LOGGER.info("Transfer succeeded: " + json);
            } else {
                LOGGER.warning("Transfer failed (insufficient funds): " + json);
            }
        }

        /**
        * Processes a single VIDA transaction.
        *
        * @param txn the transaction to handle
        */
        private static void processTransaction(FalconTransaction.PayableVidaDataTxn txn) {
            try {
                JSONObject json = new JSONObject(new String(txn.getData(), StandardCharsets.UTF_8));
                String action = json.optString("action", "");
                if ("transfer".equalsIgnoreCase(action)) {
                    handleTransfer(json, txn.getSender());
                }
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "Error processing transaction: " + txn.getTransactionHash(), e);
            }
        }

        /**
        * Callback invoked as blocks are processed.
        *
        * @param blockNumber block height that was just processed
        * @return always {@code null}
        */
        private static Void onChainProgress(long blockNumber) {
            try {
                DatabaseService.setLastCheckedBlock(blockNumber);
                checkRootHashValidityAndSave(blockNumber);
                LOGGER.info("Checkpoint updated to block " + blockNumber);
            } catch (RocksDBException e) {
                LOGGER.log(Level.WARNING, "Failed to update last checked block: " + blockNumber, e);
            } finally {
                return null;
            }
        }

        /**
        * Subscribes to VIDA transactions starting from the given block.
        *
        * @param fromBlock block height to begin synchronization from
        * @throws IOException if network communication fails
        * @throws RocksDBException if persisting data fails
        */
        public static void subscribeAndSync(long fromBlock) throws IOException, RocksDBException {
            //The subscription to VIDA transactions has a built in shutdwown hook
            subscription =
                    PWRJ_CLIENT.subscribeToVidaTransactions(
                            PWRJ_CLIENT,
                            VIDA_ID,
                            fromBlock,
                            Handler::onChainProgress,
                            Handler::processTransaction
                    );
        }
    }
    ```
</TabItem>
</Tabs>

### 5. Main Application Logic

Implement the main application logic for your stateful VIDA. This includes initializing the database, setting up the API server, configuring peers, and starting the transaction synchronization:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```javascript
    // main.js
    import express from 'express';
    import { GET } from './api/get.js';
    import DatabaseService from './databaseService.js';
    import { subscribeAndSync, peersToCheckRootHashWith } from './handler.js';

    const START_BLOCK = 1;
    const PORT = 8080;

    const INITIAL_BALANCES = new Map([
        [Buffer.from("c767ea1d613eefe0ce1610b18cb047881bafb829", 'hex'), 1000000000000n],
        [Buffer.from("3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4", 'hex'), 1000000000000n],
        [Buffer.from("9282d39ca205806473f4fde5bac48ca6dfb9d300", 'hex'), 1000000000000n],
        [Buffer.from("e68191b7913e72e6f1759531fbfaa089ff02308a", 'hex'), 1000000000000n],
    ]);

    let app = null;

    // Initializes peer list from arguments or defaults
    function initializePeers() {
        const args = process.argv.slice(2);
        
        if (args.length > 0) {
            peersToCheckRootHashWith.length = 0;
            peersToCheckRootHashWith.push(...args);
            console.log("Using peers from args:", peersToCheckRootHashWith);
        } else {
            peersToCheckRootHashWith.length = 0;
            peersToCheckRootHashWith.push("localhost:8080");
            console.log("Using default peers:", peersToCheckRootHashWith);
        }
    }

    // Sets up the initial account balances when starting from a fresh database
    async function initInitialBalances() {
        const lastCheckedBlock = await DatabaseService.getLastCheckedBlock();
        
        if (lastCheckedBlock === 0) {
            console.log("Setting up initial balances for fresh database");
            
            for (const [address, balance] of INITIAL_BALANCES) {
                await DatabaseService.setBalance(address, balance);
                console.log(`Set initial balance for ${address.toString('hex')}: ${balance}`);
            }
            console.log("Initial balances setup completed");
        }
    }

    // Start the API server in a background task
    async function startApiServer() {
        app = express();
        
        GET.run(app);
        
        return new Promise((resolve, reject) => {
            const server = app.listen(PORT, '0.0.0.0', (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`Starting API server on port ${PORT}`);
                    setTimeout(() => {
                        console.log(`API server started on http://0.0.0.0:${PORT}`);
                        resolve(server);
                    }, 2000);
                }
            });
        });
    }

    // Sets up shutdown handlers for graceful shutdown
    function setupShutdownHandlers() {
        const gracefulShutdown = async (signal) => {
            console.log(`Received ${signal}, shutting down gracefully...`);
            process.exit(0);
        };
        
        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);
    }

    // Application entry point for synchronizing VIDA transactions
    // with the local Merkle-backed database.
    async function main() {
        console.log("Starting PWR VIDA Transaction Synchronizer...");

        initializePeers();
        await DatabaseService.initialize();
        await startApiServer();
        await initInitialBalances();

        const lastBlock = await DatabaseService.getLastCheckedBlock();
        const fromBlock = lastBlock > 0 ? lastBlock : START_BLOCK;

        console.log(`Starting synchronization from block ${fromBlock}`);

        await subscribeAndSync(fromBlock);

        // Keep the main thread alive
        console.log("Application started successfully. Press Ctrl+C to exit.");
        // Graceful shutdown
        setupShutdownHandlers();
    }

    main().catch(console.error);
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```python
    # main.py
    import sys
    import threading
    import time
    from database_service import DatabaseService
    from api.get import app as api_app
    from handler import subscribe_and_sync, peers_to_check_root_hash_with

    START_BLOCK = 1
    PORT = 8080

    INITIAL_BALANCES = {
        bytes.fromhex("c767ea1d613eefe0ce1610b18cb047881bafb829"): 1_000_000_000_000,
        bytes.fromhex("3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4"): 1_000_000_000_000,
        bytes.fromhex("9282d39ca205806473f4fde5bac48ca6dfb9d300"): 1_000_000_000_000,
        bytes.fromhex("e68191b7913e72e6f1759531fbfaa089ff02308a"): 1_000_000_000_000,
    }

    flask_thread = None

    # Initializes peer list from arguments or defaults
    def initialize_peers():
        if len(sys.argv) > 1:
            peers_to_check_root_hash_with.clear()
            peers_to_check_root_hash_with.extend(sys.argv[1:])
            print(f"Using peers from args: {peers_to_check_root_hash_with}")
        else:
            peers_to_check_root_hash_with.clear()
            peers_to_check_root_hash_with.extend([
                "localhost:8080"
            ])
            print(f"Using default peers: {peers_to_check_root_hash_with}")

    # Sets up the initial account balances when starting from a fresh database
    def init_initial_balances():
        if DatabaseService.get_last_checked_block() == 0:
            print("Setting up initial balances for fresh database")
            
            for address, balance in INITIAL_BALANCES.items():
                DatabaseService.set_balance(address, balance)
                print(f"Set initial balance for {address.hex()}: {balance}")
            print("Initial balances setup completed")

    # Start the API server in a background task
    def start_api_server():
        global flask_thread
        
        def run_flask():
            try:
                print(f"Starting Flask API server on port {PORT}")
                
                # Disable Flask request logging
                import logging
                logging.getLogger('werkzeug').setLevel(logging.ERROR)
                
                api_app.run(host='0.0.0.0', port=PORT, debug=False, use_reloader=False)
            except Exception as e:
                print(f"Flask server error: {e}")
        
        flask_thread = threading.Thread(target=run_flask, daemon=True)
        flask_thread.start()
        
        time.sleep(2)
        print(f"Flask API server started on http://0.0.0.0:{PORT}")

    # Application entry point for synchronizing VIDA transactions
    # with the local Merkle-backed database.
    def main():
        print("Starting PWR VIDA Transaction Synchronizer...")
        
        initialize_peers()
        start_api_server()
        init_initial_balances()
        
        last_block = DatabaseService.get_last_checked_block()
        from_block = last_block if last_block > 0 else START_BLOCK
        
        print(f"Starting synchronization from block {from_block}")
        
        subscribe_and_sync(from_block)

    if __name__ == "__main__":
        main()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    // src/main.rs
    mod database_service;
    mod api;
    mod handler;

    use std::env;
    use std::time::Duration;
    use hex;
    use num_bigint::BigUint;
    use tokio::time::sleep;

    use crate::database_service::DatabaseService;
    use crate::api::GET;
    use crate::handler::{subscribe_and_sync, PEERS_TO_CHECK_ROOT_HASH_WITH};

    // Constants
    const START_BLOCK: u64 = 1;
    const PORT: u16 = 8080;

    // Initializes peer list from arguments or defaults
    fn initialize_peers() {
        let args: Vec<String> = env::args().collect();
        
        unsafe {
            if args.len() > 1 {
                PEERS_TO_CHECK_ROOT_HASH_WITH = args[1..].to_vec();
                println!("Using peers from args: {:?}", PEERS_TO_CHECK_ROOT_HASH_WITH);
            } else {
                PEERS_TO_CHECK_ROOT_HASH_WITH = vec![
                    "localhost:8080".to_string(),
                ];
                println!("Using default peers: {:?}", PEERS_TO_CHECK_ROOT_HASH_WITH);
            }
        }
    }

    // Sets up the initial account balances when starting from a fresh database
    async fn init_initial_balances() -> Result<(), Box<dyn std::error::Error>> {
        if DatabaseService::get_last_checked_block().map_err(|e| format!("Failed to get last checked block: {:?}", e))? == 0 {
            println!("Setting up initial balances for fresh database");
            
            let initial_balances = vec![
                (hex::decode("c767ea1d613eefe0ce1610b18cb047881bafb829").unwrap(), BigUint::from(1_000_000_000_000u64)),
                (hex::decode("3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4").unwrap(), BigUint::from(1_000_000_000_000u64)),
                (hex::decode("9282d39ca205806473f4fde5bac48ca6dfb9d300").unwrap(), BigUint::from(1_000_000_000_000u64)),
                (hex::decode("e68191b7913e72e6f1759531fbfaa089ff02308a").unwrap(), BigUint::from(1_000_000_000_000u64)),
            ];
            
            for (address, balance) in initial_balances {
                DatabaseService::set_balance(&address, &balance).map_err(|e| format!("Failed to set balance: {:?}", e))?;
                println!("Set initial balance for {}: {}", hex::encode(&address), balance);
            }
            println!("Initial balances setup completed");
        }
        
        Ok(())
    }

    /// Start the API server in a background task
    async fn start_api_server() {
        let routes = GET::run();
        
        tokio::spawn(async move {
            println!("Starting API server on port {}", PORT);
            warp::serve(routes)
                .run(([0, 0, 0, 0], PORT))
                .await;
        });
        
        // Give server time to start
        sleep(Duration::from_millis(2000)).await;
        println!("API server started on http://0.0.0.0:{}", PORT);
    }

    /// Application entry point for synchronizing VIDA transactions
    /// with the local Merkle-backed database.
    #[tokio::main]
    async fn main() -> Result<(), Box<dyn std::error::Error>> {
        println!("Starting PWR VIDA Transaction Synchronizer...");

        initialize_peers();
        DatabaseService::initialize().map_err(|e| format!("Database initialization failed: {:?}", e))?;

        start_api_server().await;
        init_initial_balances().await?;

        let last_block = DatabaseService::get_last_checked_block().map_err(|e| format!("Failed to get last checked block: {:?}", e))?;
        let from_block = if last_block > 0 { last_block } else { START_BLOCK };

        println!("Starting synchronization from block {}", from_block);

        subscribe_and_sync(from_block).await?;

        // Keep the main thread alive
        println!("Application started successfully. Press Ctrl+C to exit.");
        tokio::signal::ctrl_c().await?;

        Ok(())
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    // main.go
    package main

    import (
        "encoding/hex"
        "fmt"
        "math/big"
        "os"
        "os/signal"
        "syscall"

        "pwr-stateful-vida/api"
        "pwr-stateful-vida/dbservice"
        "github.com/gin-gonic/gin"
    )

    // Constants
    const (
        VIDA_ID     = 73746238
        START_BLOCK = 1
        PORT        = 8080
        RPC_URL     = "https://pwrrpc.pwrlabs.io"
    )

    // initializePeers initializes peer list from arguments or defaults
    func initializePeers() {
        if len(os.Args) > 1 {
            peersToCheckRootHashWith = os.Args[1:]
            fmt.Printf("Using peers from args: %v\n", peersToCheckRootHashWith)
        } else {
            peersToCheckRootHashWith = []string{"localhost:8080"}
            fmt.Printf("Using default peers: %v\n", peersToCheckRootHashWith)
        }
    }

    // initInitialBalances sets up the initial account balances when starting from a fresh database
    func initInitialBalances() {
        lastBlock, _ := dbservice.GetLastCheckedBlock()
        if lastBlock == 0 {
            fmt.Println("Setting up initial balances for fresh database")

            initialBalances := map[string]*big.Int{
                "c767ea1d613eefe0ce1610b18cb047881bafb829": big.NewInt(1000000000000),
                "3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4": big.NewInt(1000000000000),
                "9282d39ca205806473f4fde5bac48ca6dfb9d300": big.NewInt(1000000000000),
                "e68191b7913e72e6f1759531fbfaa089ff02308a": big.NewInt(1000000000000),
            }

            for addressHex, balance := range initialBalances {
                address, _ := hex.DecodeString(addressHex)
                dbservice.SetBalance(address, balance)
            }
            fmt.Println("Initial balances setup completed")
        }
    }

    // startAPIServer initializes and starts the HTTP API server
    func startAPIServer() {
        gin.SetMode(gin.ReleaseMode)
        router := gin.New()
        api.RegisterRoutes(router)

        fmt.Printf("Starting HTTP server on port %d\n", PORT)
        router.Run(fmt.Sprintf(":%d", PORT))
    }

    // main is the application entry point for synchronizing VIDA transactions
    func main() {
        fmt.Println("Starting PWR VIDA Transaction Synchronizer...")

        // Initialize peers from command line arguments
        initializePeers()

        // Set up HTTP API server
        go startAPIServer()

        // Initialize database with initial balances if needed
        initInitialBalances()

        // Get starting block number
        lastBlock, _ := dbservice.GetLastCheckedBlock()
        fromBlock := START_BLOCK
        if lastBlock > 0 {
            fromBlock = int(lastBlock)
        }

        fmt.Printf("Starting synchronization from block %d\n", fromBlock)

        // Subscribe to VIDA transactions
        subscribeAndSync(fromBlock)

        // Keep the main thread alive
        fmt.Println("Application started successfully. Press Ctrl+C to exit.")
        c := make(chan os.Signal, 1)
        signal.Notify(c, os.Interrupt, syscall.SIGTERM)
        <-c
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    // Program.cs
    using System;
    using System.Numerics;

    namespace PwrStatefulVIDA;

    public class Program
    {
        // Constants
        private const ulong START_BLOCK = 1;
        private const int PORT = 8080;
        
        // Initial balances for fresh database
        private static readonly Dictionary<byte[], BigInteger> INITIAL_BALANCES = new()
        {
            { Convert.FromHexString("c767ea1d613eefe0ce1610b18cb047881bafb829"), new BigInteger(1000000000000) },
            { Convert.FromHexString("3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4"), new BigInteger(1000000000000) },
            { Convert.FromHexString("9282d39ca205806473f4fde5bac48ca6dfb9d300"), new BigInteger(1000000000000) },
            { Convert.FromHexString("e68191b7913e72e6f1759531fbfaa089ff02308a"), new BigInteger(1000000000000) },
        };

        private static void InitializePeers(string[] args)
        {
            if (args.Length > 0)
            {
                Handler.peersToCheckRootHashWith = args.ToList();
                Console.WriteLine($"Using peers from args: [{string.Join(", ", Handler.peersToCheckRootHashWith)}]");
            }
            else
            {
                Handler.peersToCheckRootHashWith = new List<string> { "localhost:8080" };
                Console.WriteLine($"Using default peers: [{string.Join(", ", Handler.peersToCheckRootHashWith)}]");
            }
        }

        private static void InitInitialBalances()
        {
            var lastCheckedBlock = DatabaseService.GetLastCheckedBlock();

            if (lastCheckedBlock == 0)
            {
                Console.WriteLine("Setting up initial balances for fresh database");

                foreach (var (address, balance) in INITIAL_BALANCES)
                {
                    DatabaseService.SetBalance(address, balance);
                    Console.WriteLine($"Set initial balance for {Convert.ToHexString(address).ToLowerInvariant()}: {balance}");
                }
                Console.WriteLine("Initial balances setup completed");
            }
        }

        private static async Task StartApiServer()
        {
            var builder = WebApplication.CreateBuilder();
            builder.WebHost.UseUrls($"http://0.0.0.0:{PORT}");
            
            // Disable ASP.NET Core request logging
            builder.Logging.ClearProviders();
            builder.Logging.SetMinimumLevel(LogLevel.Warning);
            
            var app = builder.Build();
            GET.Run(app);

            _ = Task.Run(async () =>
            {
                Console.WriteLine($"Starting API server on port {PORT}");
                await app.RunAsync();
            });

            await Task.Delay(2000);
            Console.WriteLine($"API server started on http://0.0.0.0:{PORT}");
        }

        public static async Task Main(string[] args)
        {
            Console.WriteLine("Starting PWR VIDA Transaction Synchronizer...");
            
            InitializePeers(args);
            DatabaseService.Initialize();
            await StartApiServer();
            InitInitialBalances();
            
            var lastBlock = DatabaseService.GetLastCheckedBlock();
            var fromBlock = lastBlock > 0 ? lastBlock : START_BLOCK;
            
            Console.WriteLine($"Starting synchronization from block {fromBlock}");
            
            await Handler.SubscribeAndSync(fromBlock);
            
            // Keep the main thread alive
            Console.WriteLine("Application started successfully. Press Ctrl+C to exit.");
            Console.CancelKeyPress += (sender, e) =>
            {
                e.Cancel = true;
                Environment.Exit(0);
            };
            await Task.Delay(Timeout.Infinite);
        }
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    // Main.java
    package main;

    import api.GET;
    import org.bouncycastle.util.encoders.Hex;
    import org.rocksdb.RocksDBException;

    import java.io.IOException;
    import java.math.BigInteger;
    import java.util.Arrays;
    import java.util.List;
    import java.util.logging.Level;
    import java.util.logging.Logger;

    import static spark.Spark.port;

    /**
    * Entry point for synchronizing VIDA transactions with the local Merkle-backed database.
    */
    public final class Main {
        private static final Logger LOGGER = Logger.getLogger(Main.class.getName());
        private static final long START_BLOCK = 1L;
        private static final int PORT = 8080;
        public static List<String> peersToCheckRootHashWith;

        /**
        * Initializes peer list from arguments or defaults.
        * @param args command-line arguments; if present, each arg is a peer hostname
        */
        private static void initializePeers(String[] args) {
            if (args != null && args.length > 0) {
                peersToCheckRootHashWith = Arrays.asList(args);
                LOGGER.info("Using peers from args: " + peersToCheckRootHashWith);
            } else {
                peersToCheckRootHashWith = List.of(
                        "localhost:8080"
                );
                LOGGER.info("Using default peers: " + peersToCheckRootHashWith);
            }
        }

        /**
        * Sets up the initial account balances when starting from a fresh database.
        *
        * @throws RocksDBException if persisting the balances fails
        */
        private static void initInitialBalances() throws RocksDBException {
            if(DatabaseService.getLastCheckedBlock() == 0) {
                DatabaseService.setBalance(Hex.decode("c767ea1d613eefe0ce1610b18cb047881bafb829"), BigInteger.valueOf(1_0000_000_000_000L));
                DatabaseService.setBalance(Hex.decode("3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4"), BigInteger.valueOf(1_0000_000_000_000L));
                DatabaseService.setBalance(Hex.decode("9282d39ca205806473f4fde5bac48ca6dfb9d300"), BigInteger.valueOf(1_0000_000_000_000L));
                DatabaseService.setBalance(Hex.decode("e68191b7913e72e6f1759531fbfaa089ff02308a"), BigInteger.valueOf(1_0000_000_000_000L));
            }
        }

        /**
        * Application entry point.
        *
        * @param args optional list of peer hosts to query for root hash
        */
        public static void main(String[] args) {
            try {
                port(PORT);
                GET.run();
                initInitialBalances();
                initializePeers(args);
                long lastBlock = DatabaseService.getLastCheckedBlock();
                long fromBlock = (lastBlock > 0) ? lastBlock : START_BLOCK;
                Handler.subscribeAndSync(fromBlock);
            } catch (IOException | RocksDBException e) {
                LOGGER.log(Level.SEVERE, "Initialization failed", e);
            }
        }
    }
    ```
</TabItem>
</Tabs>

### 6. Run the project

To run the PWR Stateful VIDA project, add the following command:

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```bash
    node main.js
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```bash
    python main.py
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```bash
    cargo build --release
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

## Transaction Data Structure

Define the JSON schema for your stateful VIDA transactions:

**Transfer Transaction Example:**
```json
{
    "action": "transfer",
    "receiver": "0x3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4",
    "amount": 1000000000
}
```

## Best Practices for Stateful VIDAs

1. **Always Validate State**: Never trust local state without peer consensus
2. **Handle Consensus Failures**: Implement robust error recovery mechanisms
3. **Monitor Performance**: Track consensus time and database performance
4. **Secure Peer Communication**: Use HTTPS in production environments
5. **Backup Strategy**: Regular database backups for disaster recovery
6. **Gradual Rollouts**: Test thoroughly before deploying state changes

## Conclusion

Building stateful VIDAs requires careful consideration of data consistency, consensus mechanisms, and error handling. This tutorial provides a foundation for creating robust, production-ready applications that maintain critical state on the PWR Chain.

The example token transfer system demonstrates all key concepts you'll need for more complex stateful applications, including financial systems, voting mechanisms, and other use cases where data integrity is paramount.

Remember: stateful VIDAs trade simplicity for consistency and reliability. Choose this architecture when your application requires strong guarantees about data integrity and state consistency across network participants.

## Next Steps

While this guide focuses on conceptual foundations, future resources will include:

- **Video Tutorials**: Step-by-step walkthroughs for designing and deploying stateful VIDAs.
- **Code Examples**: Templates for root hash generation, cross-validation, and Conduit Node integration.

By combining PWR Chain’s immutable ledger with robust state management, stateful VIDAs empower developers to build decentralized applications that are as reliable as traditional enterprise software—but with unmatched transparency and security.
