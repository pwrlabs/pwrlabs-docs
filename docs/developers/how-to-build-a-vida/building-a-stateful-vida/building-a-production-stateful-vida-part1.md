---
title: Building a Production Stateful VIDA - Part 1
sidebar_position: 3
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Building a Production Stateful VIDA - Part 1

Stateful VIDAs are robust, consistent, and reliable applications that maintain and validate persistent state across execution instances. They are essential for critical use cases such as financial applications, token systems, voting mechanisms, or any application where data integrity and consistency are paramount.

Unlike stateless VIDAs, stateful VIDAs require:
- **Persistent storage** for maintaining state between transactions
- **State validation** to ensure data consistency across network participants
- **Consensus mechanisms** for distributed state agreement
- **Recovery systems** for handling errors and network partitions

## Architecture Overview

This tutorial builds a **token transfer system** that demonstrates all key concepts of stateful VIDAs:

- **Database Layer**: RocksDB with MerkleTree for cryptographic state verification
- **Transaction Processing**: Handles token transfers with balance validation
- **Peer Consensus**: Validates state consistency across network nodes
- **API Layer**: HTTP endpoints for inter-node communication
- **Error Recovery**: Robust handling of consensus failures and data inconsistencies

## What Makes a Production Stateful VIDA Different?

While Lite Stateful VIDAs demonstrate core concepts with simplified implementations, production Stateful VIDAs include:

| Feature | Lite Stateful VIDA | Production Stateful VIDA |
|---------|-------------------|--------------------------|
| Storage | HashMap (memory) | MerkleTree (persistent database) |
| State Validation | None | Cryptographic root hashes |
| Consensus | Single instance | Multi-peer validation |
| Recovery | Restart from scratch | Checkpoint-based recovery |
| Production Ready | ❌ | ✅ |

## Steps to Build a Production Stateful VIDA

### 1. Project Setup and Dependencies

Create a new Maven project with the required dependencies for PWR SDK, database storage, and HTTP server.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```bash
    mkdir pwr-stateful-vida && cd pwr-stateful-vida
    npm init -y
    npm install @pwrjs/core express
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```bash
    mkdir pwr_stateful_vida && cd pwr_stateful_vida
    python3 -m venv venv
    source venv/bin/activate 
    pip install pwrpy flask
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```bash
    cargo new pwr_stateful_vida && cd pwr_stateful_vida
    cargo add pwr-rs serde_json serde num-bigint hex warp reqwest
    cargo add tokio@1.0 --features full
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```bash
    mkdir pwr-stateful-vida && cd pwr-stateful-vida
    go mod init pwr-stateful-vida
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```bash
    dotnet new console -n pwr-stateful-vida && cd pwr-stateful-vida
    dotnet add package PWR
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <project xmlns="http://maven.apache.org/POM/4.0.0"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <modelVersion>4.0.0</modelVersion>

        <groupId>org.example</groupId>
        <artifactId>PWR-Stateful-Vida</artifactId>
        <version>1.0-SNAPSHOT</version>

        <repositories>
            <repository>
                <id>jitpack.io</id>
                <url>https://jitpack.io</url>
            </repository>
        </repositories>

        <dependencies>
            <!-- PWR SDK for blockchain interaction -->
            <dependency>
                <groupId>com.github.pwrlabs</groupId>
                <artifactId>pwrj</artifactId>
                <version>11.5.3</version>
            </dependency>

            <!-- Spark Java for HTTP API -->
            <dependency>
                <groupId>com.sparkjava</groupId>
                <artifactId>spark-core</artifactId>
                <version>2.9.3</version>
            </dependency>
        </dependencies>

        <properties>
            <maven.compiler.source>21</maven.compiler.source>
            <maven.compiler.target>21</maven.compiler.target>
            <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        </properties>
    </project>
    ```
</TabItem>
</Tabs>

### 2. Database Layer Implementation

Create a singleton service for managing persistent state using MerkleTree for cryptographic verification.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    // databaseService.js
    import { MerkleTree } from "@pwrjs/core/services"

    class DatabaseService {
        static #tree = null;
        static #initialized = false;
        static #LAST_CHECKED_BLOCK_KEY = Buffer.from('lastCheckedBlock');
        static #BLOCK_ROOT_PREFIX = 'blockRootHash_';

        static async initialize() {
            if (this.#initialized) {
                throw new Error('DatabaseService already initialized');
            }
            
            try {
                this.#tree = new MerkleTree('database');
                await this.#tree.ensureInitialized();
                this.#initialized = true;
                
                process.on('SIGINT', () => this.#cleanup());
                process.on('SIGTERM', () => this.#cleanup());
                process.on('exit', () => this.#cleanup());
                process.on('uncaughtException', () => this.#cleanup());
                process.on('unhandledRejection', () => this.#cleanup());
                
            } catch (error) {
                throw new Error(`Failed to initialize DatabaseService: ${error.message}`);
            }
        }

        static #getTree() {
            if (!this.#initialized || !this.#tree) {
                throw new Error('DatabaseService not initialized. Call initialize() first.');
            }
            return this.#tree;
        }

        static async #cleanup() {
            if (this.#tree && !this.#tree.closed) {
                try {
                    await this.#tree.close();
                } catch (error) {
                    console.error('Error closing MerkleTree:', error);
                }
            }
        }

        static async getRootHash() {
            const tree = this.#getTree();
            return await tree.getRootHash();
        }

        static async flush() {
            const tree = this.#getTree();
            return await tree.flushToDisk();
        }

        static async revertUnsavedChanges() {
            const tree = this.#getTree();
            return await tree.revertUnsavedChanges();
        }

        static async getBalance(address) {
            if (!address || address.length === 0) {
                throw new Error('Address must not be empty');
            }

            const tree = this.#getTree();
            const data = await tree.getData(Buffer.from(address));
            
            if (!data || data.length === 0) {
                return 0n;
            }
            
            return this.#bytesToBigInt(data);
        }

        static async setBalance(address, balance) {
            if (!address || address.length === 0) {
                throw new Error('Address must not be empty');
            }

            const tree = this.#getTree();
            const balanceBytes = this.#bigIntToBytes(balance);
            return await tree.addOrUpdateData(Buffer.from(address), balanceBytes);
        }

        static async transfer(sender, receiver, amount) {
            if (!sender || sender.length === 0) {
                throw new Error('Sender address must not be empty');
            }
            if (!receiver || receiver.length === 0) {
                throw new Error('Receiver address must not be empty');
            }

            const senderBalance = await this.getBalance(sender);
            
            if (senderBalance < amount) {
                return false;
            }

            const newSenderBalance = senderBalance - amount;
            const receiverBalance = await this.getBalance(receiver);
            const newReceiverBalance = receiverBalance + amount;

            await this.setBalance(sender, newSenderBalance);
            await this.setBalance(receiver, newReceiverBalance);

            return true;
        }

        static async getLastCheckedBlock() {
            const tree = this.#getTree();
            const data = await tree.getData(this.#LAST_CHECKED_BLOCK_KEY);
            
            if (!data || data.length < 8) {
                return 0;
            }

            const buffer = Buffer.from(data.slice(0, 8));
            return Number(buffer.readBigUInt64BE(0));
        }

        static async setLastCheckedBlock(blockNumber) {
            const tree = this.#getTree();
            const buffer = Buffer.allocUnsafe(8);
            buffer.writeBigUInt64BE(BigInt(blockNumber), 0);
            return await tree.addOrUpdateData(this.#LAST_CHECKED_BLOCK_KEY, buffer);
        }

        static async setBlockRootHash(blockNumber, rootHash) {
            if (!rootHash || rootHash.length === 0) {
                throw new Error('Root hash must not be empty');
            }

            const tree = this.#getTree();
            const key = Buffer.from(`${this.#BLOCK_ROOT_PREFIX}${blockNumber}`);
            return await tree.addOrUpdateData(key, Buffer.from(rootHash));
        }

        static async getBlockRootHash(blockNumber) {
            const tree = this.#getTree();
            const key = Buffer.from(`${this.#BLOCK_ROOT_PREFIX}${blockNumber}`);
            return await tree.getData(key);
        }

        static async close() {
            if (this.#tree && !this.#tree.closed) {
                await this.#tree.close();
            }
            this.#initialized = false;
            this.#tree = null;
        }

        static #bytesToBigInt(bytes) {
            if (bytes.length === 0) return 0n;
            let result = 0n;
            for (let i = 0; i < bytes.length; i++) {
                result = (result << 8n) | BigInt(bytes[i]);
            }
            return result;
        }

        static #bigIntToBytes(bigint) {
            if (bigint === 0n) return Buffer.from([0]);
            
            const bytes = [];
            let value = bigint;
            while (value > 0n) {
                bytes.unshift(Number(value & 0xFFn));
                value = value >> 8n;
            }
            return Buffer.from(bytes);
        }
    }

    export default DatabaseService;
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    # database_service.py
    import atexit
    import struct
    import threading
    from typing import Optional
    from pwrpy.models.MerkleTree import MerkleTree

    class DatabaseServiceError(Exception):
        """Custom exception for DatabaseService operations"""
        pass

    # Global instance and lock
    _tree = None
    _lock = threading.Lock()

    # Constants
    LAST_CHECKED_BLOCK_KEY = b"lastCheckedBlock"
    BLOCK_ROOT_PREFIX = "blockRootHash_"

    def _get_tree():
        """Get or create the global MerkleTree instance"""
        global _tree
        if _tree is None:
            with _lock:
                if _tree is None:
                    try:
                        _tree = MerkleTree("database")
                        atexit.register(_shutdown_hook)
                    except Exception as e:
                        raise DatabaseServiceError(f"Failed to initialize MerkleTree: {str(e)}")
        return _tree

    def _shutdown_hook():
        """Cleanup method called on application shutdown"""
        global _tree
        try:
            if _tree is not None:
                _tree.close()
        except Exception as e:
            print(f"Error during DatabaseService shutdown: {e}")

    class DatabaseService:
        """Database service class providing methods for Merkle tree operations"""
        
        @staticmethod
        def get_root_hash() -> Optional[bytes]:
            """Get current Merkle root hash"""
            try:
                tree = _get_tree()
                return tree.get_root_hash()
            except Exception as e:
                raise DatabaseServiceError(f"Error getting root hash: {str(e)}")

        @staticmethod
        def flush():
            """Flush pending writes to disk"""
            try:
                tree = _get_tree()
                tree.flush_to_disk()
            except Exception as e:
                raise DatabaseServiceError(f"Error flushing to disk: {str(e)}")

        @staticmethod
        def revert_unsaved_changes():
            """Reverts all unsaved changes to the Merkle tree"""
            try:
                tree = _get_tree()
                tree.revert_unsaved_changes()
            except Exception as e:
                raise DatabaseServiceError(f"Error reverting changes: {str(e)}")

        @staticmethod
        def get_balance(address: bytes) -> int:
            """Retrieves the balance stored at the given address"""
            if address is None:
                raise ValueError("Address must not be null")
            
            try:
                tree = _get_tree()
                data = tree.get_data(address)
                
                if data is None or len(data) == 0:
                    return 0
                
                return int.from_bytes(data, byteorder='big', signed=False)
                
            except Exception as e:
                raise DatabaseServiceError(f"Error getting balance: {str(e)}")

        @staticmethod
        def set_balance(address: bytes, balance: int):
            """Sets the balance for the given address"""
            if address is None:
                raise ValueError("Address must not be null")
            if balance is None:
                raise ValueError("Balance must not be null")
            if balance < 0:
                raise ValueError("Balance must be non-negative")
            
            try:
                tree = _get_tree()
                balance_bytes = balance.to_bytes((balance.bit_length() + 7) // 8, byteorder='big', signed=False)
                if balance == 0:
                    balance_bytes = b'\x00'
                
                tree.add_or_update_data(address, balance_bytes)
                
            except Exception as e:
                raise DatabaseServiceError(f"Error setting balance: {str(e)}")

        @staticmethod
        def transfer(sender: bytes, receiver: bytes, amount: int) -> bool:
            """Transfers amount from sender to receiver"""
            if sender is None:
                raise ValueError("Sender must not be null")
            if receiver is None:
                raise ValueError("Receiver must not be null")
            if amount is None:
                raise ValueError("Amount must not be null")
            
            try:
                sender_balance = DatabaseService.get_balance(sender)
                if sender_balance < amount:
                    return False
                
                DatabaseService.set_balance(sender, sender_balance - amount)
                receiver_balance = DatabaseService.get_balance(receiver)
                DatabaseService.set_balance(receiver, receiver_balance + amount)
                
                return True
                
            except Exception as e:
                raise DatabaseServiceError(f"Error during transfer: {str(e)}")

        @staticmethod
        def get_last_checked_block() -> int:
            """Get the last checked block number"""
            try:
                tree = _get_tree()
                data = tree.get_data(LAST_CHECKED_BLOCK_KEY)
                
                if data is None or len(data) < 8:
                    return 0
                
                return struct.unpack('>Q', data)[0]
                
            except Exception as e:
                raise DatabaseServiceError(f"Error getting last checked block: {str(e)}")

        @staticmethod
        def set_last_checked_block(block_number: int):
            """Updates the last checked block number"""
            if block_number < 0:
                raise ValueError("Block number must be non-negative")
            
            try:
                tree = _get_tree()
                data = struct.pack('>Q', block_number)
                tree.add_or_update_data(LAST_CHECKED_BLOCK_KEY, data)
                
            except Exception as e:
                raise DatabaseServiceError(f"Error setting last checked block: {str(e)}")

        @staticmethod
        def set_block_root_hash(block_number: int, root_hash: bytes):
            """Records the Merkle root hash for a specific block"""
            if root_hash is None:
                raise ValueError("Root hash must not be null")
            
            try:
                tree = _get_tree()
                key = f"{BLOCK_ROOT_PREFIX}{block_number}"
                tree.add_or_update_data(key.encode('utf-8'), root_hash)
                
            except Exception as e:
                raise DatabaseServiceError(f"Error setting block root hash: {str(e)}")

        @staticmethod
        def get_block_root_hash(block_number: int) -> Optional[bytes]:
            """Retrieves the Merkle root hash for a specific block"""
            try:
                tree = _get_tree()
                key = f"{BLOCK_ROOT_PREFIX}{block_number}"
                return tree.get_data(key.encode('utf-8'))
                
            except Exception as e:
                raise DatabaseServiceError(f"Error getting block root hash: {str(e)}")
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    // src/database_service.rs
    use std::sync::{Arc, OnceLock};
    use pwr_rs::merkle_tree::{MerkleTree, MerkleTreeError};
    use num_bigint::BigUint;
    use std::convert::TryInto;

    /// Singleton service for interacting with the underlying RocksDB-backed MerkleTree.
    /// Provides methods for managing account balances, transfers, block tracking, and
    /// Merkle root hash operations.
    pub struct DatabaseService;

    // Global static instance of the MerkleTree
    static TREE: OnceLock<Arc<MerkleTree>> = OnceLock::new();

    // Constants
    const LAST_CHECKED_BLOCK_KEY: &[u8] = b"lastCheckedBlock";
    const BLOCK_ROOT_PREFIX: &str = "blockRootHash_";

    impl DatabaseService {
        /// Initialize the DatabaseService. Must be called once before using any other methods.
        pub fn initialize() -> Result<(), MerkleTreeError> {
            let tree = MerkleTree::new("database".to_string())?;
            TREE.set(tree).map_err(|_| {
                MerkleTreeError::IllegalState("DatabaseService already initialized".to_string())
            })?;
            Ok(())
        }
        
        /// Get the global tree instance
        fn get_tree() -> Result<&'static Arc<MerkleTree>, MerkleTreeError> {
            TREE.get().ok_or_else(|| {
                MerkleTreeError::IllegalState("DatabaseService not initialized. Call initialize() first.".to_string())
            })
        }
        
        /// Get current Merkle root hash
        pub fn get_root_hash() -> Result<Option<Vec<u8>>, MerkleTreeError> {
            let tree = Self::get_tree()?;
            tree.get_root_hash()
        }
        
        /// Flush pending writes to disk
        pub fn flush() -> Result<(), MerkleTreeError> {
            let tree = Self::get_tree()?;
            tree.flush_to_disk()
        }
        
        /// Reverts all unsaved changes to the Merkle tree
        pub fn revert_unsaved_changes() -> Result<(), MerkleTreeError> {
            let tree = Self::get_tree()?;
            tree.revert_unsaved_changes()
        }
        
        /// Retrieves the balance stored at the given address
        pub fn get_balance(address: &[u8]) -> Result<BigUint, MerkleTreeError> {
            if address.is_empty() {
                return Err(MerkleTreeError::InvalidArgument("Address must not be empty".to_string()));
            }
            
            let tree = Self::get_tree()?;
            let data = tree.get_data(address)?;
            
            match data {
                Some(bytes) if !bytes.is_empty() => {
                    Ok(BigUint::from_bytes_be(&bytes))
                }
                _ => Ok(BigUint::from(0u32))
            }
        }
        
        /// Sets the balance for the given address
        pub fn set_balance(address: &[u8], balance: &BigUint) -> Result<(), MerkleTreeError> {
            if address.is_empty() {
                return Err(MerkleTreeError::InvalidArgument("Address must not be empty".to_string()));
            }
            
            let tree = Self::get_tree()?;
            let balance_bytes = balance.to_bytes_be();
            tree.add_or_update_data(address, &balance_bytes)
        }
        
        /// Transfers amount from sender to receiver
        pub fn transfer(sender: &[u8], receiver: &[u8], amount: &BigUint) -> Result<bool, MerkleTreeError> {
            if sender.is_empty() {
                return Err(MerkleTreeError::InvalidArgument("Sender address must not be empty".to_string()));
            }
            if receiver.is_empty() {
                return Err(MerkleTreeError::InvalidArgument("Receiver address must not be empty".to_string()));
            }
            
            let sender_balance = Self::get_balance(sender)?;
            
            if sender_balance < *amount {
                return Ok(false);
            }
            
            let new_sender_balance = &sender_balance - amount;
            let receiver_balance = Self::get_balance(receiver)?;
            let new_receiver_balance = &receiver_balance + amount;
            
            Self::set_balance(sender, &new_sender_balance)?;
            Self::set_balance(receiver, &new_receiver_balance)?;
            
            Ok(true)
        }
        
        /// Get the last checked block number
        pub fn get_last_checked_block() -> Result<u64, MerkleTreeError> {
            let tree = Self::get_tree()?;
            let data = tree.get_data(LAST_CHECKED_BLOCK_KEY)?;
            
            match data {
                Some(bytes) if bytes.len() >= 8 => {
                    let block_bytes: [u8; 8] = bytes[..8].try_into()
                        .map_err(|_| MerkleTreeError::InvalidArgument("Invalid block number format".to_string()))?;
                    Ok(u64::from_be_bytes(block_bytes))
                }
                _ => Ok(0)
            }
        }
        
        /// Updates the last checked block number
        pub fn set_last_checked_block(block_number: u64) -> Result<(), MerkleTreeError> {
            let tree = Self::get_tree()?;
            let block_bytes = block_number.to_be_bytes();
            tree.add_or_update_data(LAST_CHECKED_BLOCK_KEY, &block_bytes)
        }
        
        /// Records the Merkle root hash for a specific block
        pub fn set_block_root_hash(block_number: u64, root_hash: &[u8]) -> Result<(), MerkleTreeError> {
            if root_hash.is_empty() {
                return Err(MerkleTreeError::InvalidArgument("Root hash must not be empty".to_string()));
            }
            
            let tree = Self::get_tree()?;
            let key = format!("{}{}", BLOCK_ROOT_PREFIX, block_number);
            tree.add_or_update_data(key.as_bytes(), root_hash)
        }
        
        /// Retrieves the Merkle root hash for a specific block
        pub fn get_block_root_hash(block_number: u64) -> Result<Option<Vec<u8>>, MerkleTreeError> {
            let tree = Self::get_tree()?;
            let key = format!("{}{}", BLOCK_ROOT_PREFIX, block_number);
            tree.get_data(key.as_bytes())
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    // dbservice/main.go
    package dbservice

    import (
        "encoding/binary"
        "math/big"
        "sync"

        "github.com/pwrlabs/pwrgo/config/merkletree"
    )

    var (
        tree                *merkletree.MerkleTree
        initOnce            sync.Once
        lastCheckedBlockKey = []byte("lastCheckedBlock")
        blockRootPrefix     = "blockRootHash_"
    )

    // initialize sets up the singleton MerkleTree instance
    func initialize() {
        initOnce.Do(func() {
            tree, _ = merkletree.NewMerkleTree("database")
        })
    }

    // GetRootHash returns the current Merkle root hash
    func GetRootHash() ([]byte, error) {
        initialize()
        return tree.GetRootHash()
    }

    // Flush pending writes to disk
    func Flush() error {
        initialize()
        return tree.FlushToDisk()
    }

    // RevertUnsavedChanges reverts all unsaved changes
    func RevertUnsavedChanges() error {
        initialize()
        return tree.RevertUnsavedChanges()
    }

    // GetBalance retrieves the balance stored at the given address
    func GetBalance(address []byte) (*big.Int, error) {
        initialize()
        if address == nil {
            return big.NewInt(0), nil
        }

        data, err := tree.GetData(address)
        if err != nil {
            return nil, err
        }

        if data == nil || len(data) == 0 {
            return big.NewInt(0), nil
        }

        balance := new(big.Int)
        balance.SetBytes(data)
        return balance, nil
    }

    // SetBalance sets the balance for the given address
    func SetBalance(address []byte, balance *big.Int) error {
        initialize()
        if address == nil || balance == nil {
            return nil
        }

        return tree.AddOrUpdateData(address, balance.Bytes())
    }

    // Transfer transfers amount from sender to receiver
    func Transfer(sender, receiver []byte, amount *big.Int) (bool, error) {
        initialize()
        if sender == nil || receiver == nil || amount == nil {
            return false, nil
        }

        senderBalance, err := GetBalance(sender)
        if err != nil {
            return false, err
        }

        if senderBalance.Cmp(amount) < 0 {
            return false, nil // Insufficient funds
        }

        newSenderBalance := new(big.Int).Sub(senderBalance, amount)
        if err := SetBalance(sender, newSenderBalance); err != nil {
            return false, err
        }

        receiverBalance, _ := GetBalance(receiver)
        newReceiverBalance := new(big.Int).Add(receiverBalance, amount)
        if err := SetBalance(receiver, newReceiverBalance); err != nil {
            return false, err
        }

        return true, nil
    }

    // GetLastCheckedBlock returns the last checked block number
    func GetLastCheckedBlock() (int64, error) {
        initialize()
        data, err := tree.GetData(lastCheckedBlockKey)
        if err != nil {
            return 0, err
        }

        if data == nil || len(data) < 8 {
            return 0, nil
        }

        return int64(binary.BigEndian.Uint64(data)), nil
    }

    // SetLastCheckedBlock updates the last checked block number
    func SetLastCheckedBlock(blockNumber int64) error {
        initialize()
        blockBytes := make([]byte, 8)
        binary.BigEndian.PutUint64(blockBytes, uint64(blockNumber))
        return tree.AddOrUpdateData(lastCheckedBlockKey, blockBytes)
    }

    // SetBlockRootHash records the Merkle root hash for a specific block
    func SetBlockRootHash(blockNumber int64, rootHash []byte) error {
        initialize()
        if rootHash == nil {
            return nil
        }

        key := []byte(blockRootPrefix + string(rune(blockNumber)))
        return tree.AddOrUpdateData(key, rootHash)
    }

    // GetBlockRootHash retrieves the Merkle root hash for a specific block
    func GetBlockRootHash(blockNumber int64) ([]byte, error) {
        initialize()
        key := []byte(blockRootPrefix + string(rune(blockNumber)))
        return tree.GetData(key)
    }

    // Close explicitly closes the DatabaseService
    func Close() error {
        if tree != nil {
            return tree.Close()
        }
        return nil
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    // DatabaseService.cs
    using System;
    using System.Numerics;
    using System.Text;
    using PWR.Utils.MerkleTree;

    namespace PwrStatefulVIDA;

    public static class DatabaseService
    {
        private static MerkleTree? _tree = null;
        private static readonly object _lock = new object();
        private static readonly byte[] LAST_CHECKED_BLOCK_KEY = Encoding.UTF8.GetBytes("lastCheckedBlock");
        private const string BLOCK_ROOT_PREFIX = "blockRootHash_";

        public static void Initialize()
        {
            lock (_lock)
            {
                if (_tree != null)
                {
                    throw new InvalidOperationException("DatabaseService already initialized");
                }

                _tree = new MerkleTree("database");
                
                AppDomain.CurrentDomain.ProcessExit += (sender, e) => 
                {
                    try
                    {
                        Close();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error during shutdown: {ex.Message}");
                    }
                };
            }
        }

        private static MerkleTree GetTree()
        {
            if (_tree == null)
            {
                throw new InvalidOperationException("DatabaseService not initialized. Call Initialize() first.");
            }
            return _tree;
        }

        public static byte[]? GetRootHash()
        {
            var tree = GetTree();
            return tree.GetRootHash();
        }

        public static void Flush()
        {
            var tree = GetTree();
            tree.FlushToDisk();
        }

        public static void RevertUnsavedChanges()
        {
            var tree = GetTree();
            tree.RevertUnsavedChanges();
        }

        public static BigInteger GetBalance(byte[] address)
        {
            if (address == null || address.Length == 0)
            {
                throw new ArgumentException("Address must not be empty");
            }

            var tree = GetTree();
            var data = tree.GetData(address);

            if (data != null && data.Length > 0)
            {
                return new BigInteger(data, isUnsigned: true, isBigEndian: true);
            }

            return BigInteger.Zero;
        }

        public static void SetBalance(byte[] address, BigInteger balance)
        {
            if (address == null || address.Length == 0)
            {
                throw new ArgumentException("Address must not be empty");
            }

            var tree = GetTree();
            var balanceBytes = balance.ToByteArray(isUnsigned: true, isBigEndian: true);
            tree.AddOrUpdateData(address, balanceBytes);
        }

        public static bool Transfer(byte[] sender, byte[] receiver, BigInteger amount)
        {
            if (sender == null || sender.Length == 0)
            {
                throw new ArgumentException("Sender address must not be empty");
            }
            if (receiver == null || receiver.Length == 0)
            {
                throw new ArgumentException("Receiver address must not be empty");
            }

            var senderBalance = GetBalance(sender);

            if (senderBalance < amount)
            {
                return false;
            }

            var newSenderBalance = senderBalance - amount;
            var receiverBalance = GetBalance(receiver);
            var newReceiverBalance = receiverBalance + amount;

            SetBalance(sender, newSenderBalance);
            SetBalance(receiver, newReceiverBalance);

            return true;
        }

        public static ulong GetLastCheckedBlock()
        {
            var tree = GetTree();
            var data = tree.GetData(LAST_CHECKED_BLOCK_KEY);

            if (data != null && data.Length >= 8)
            {
                try
                {
                    if (BitConverter.IsLittleEndian)
                    {
                        Array.Reverse(data, 0, 8);
                    }
                    return BitConverter.ToUInt64(data, 0);
                }
                catch (Exception)
                {
                    throw new ArgumentException("Invalid block number format");
                }
            }

            return 0;
        }

        public static void SetLastCheckedBlock(ulong blockNumber)
        {
            var tree = GetTree();
            var blockBytes = BitConverter.GetBytes(blockNumber);
            
            if (BitConverter.IsLittleEndian)
            {
                Array.Reverse(blockBytes);
            }
            
            tree.AddOrUpdateData(LAST_CHECKED_BLOCK_KEY, blockBytes);
        }

        public static void SetBlockRootHash(ulong blockNumber, byte[] rootHash)
        {
            if (rootHash == null || rootHash.Length == 0)
            {
                throw new ArgumentException("Root hash must not be empty");
            }

            var tree = GetTree();
            var key = Encoding.UTF8.GetBytes($"{BLOCK_ROOT_PREFIX}{blockNumber}");
            tree.AddOrUpdateData(key, rootHash);
        }

        public static byte[]? GetBlockRootHash(ulong blockNumber)
        {
            var tree = GetTree();
            var key = Encoding.UTF8.GetBytes($"{BLOCK_ROOT_PREFIX}{blockNumber}");
            return tree.GetData(key);
        }

        public static void Close()
        {
            lock (_lock)
            {
                if (_tree != null)
                {
                    _tree.Close();
                    _tree = null;
                }
            }
        }
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    // DatabaseService.java
    package main;

    import io.pwrlabs.database.rocksdb.MerkleTree;
    import org.rocksdb.RocksDBException;

    import java.math.BigInteger;
    import java.nio.ByteBuffer;
    import java.nio.charset.StandardCharsets;
    import java.util.Objects;

    /**
    * Singleton service for interacting with the underlying RocksDB-backed MerkleTree.
    * Provides methods for managing account balances, transfers, block tracking, and
    * Merkle root hash operations. All operations may throw RocksDBException.
    *
    * <p>This service maintains:
    * <ul>
    *   <li>Account balances stored in the Merkle tree</li>
    *   <li>Last checked block number for synchronization</li>
    *   <li>Historical block root hashes for validation</li>
    * </ul>
    *
    * <p>The underlying MerkleTree is automatically closed on JVM shutdown.
    */
    public final class DatabaseService {
        private static final MerkleTree TREE;
        private static final byte[] LAST_CHECKED_BLOCK_KEY = "lastCheckedBlock".getBytes(StandardCharsets.UTF_8);
        private static final String BLOCK_ROOT_PREFIX = "blockRootHash_";

        static {
            try {
                TREE = new MerkleTree("database");
            } catch (RocksDBException e) {
                throw new ExceptionInInitializerError("Failed to initialize MerkleTree: " + e.getMessage());
            }
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                try {
                    TREE.close();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }));
        }

        /**
        * @return current Merkle root hash
        * @throws RocksDBException on RocksDB errors
        */
        public static byte[] getRootHash() throws RocksDBException {
            return TREE.getRootHash();
        }

        /**
        * Flush pending writes to disk.
        * @throws RocksDBException on RocksDB errors
        */
        public static void flush() throws RocksDBException {
            TREE.flushToDisk();
        }

        /**
        * Reverts all unsaved changes to the Merkle tree, restoring it to the last
        * flushed state. This is useful for rolling back invalid transactions or
        * when consensus validation fails.
        */
        public static void revertUnsavedChanges() {
                TREE.revertUnsavedChanges();
        }

        /**
        * Retrieves the balance stored at the given address.
        *
        * @param address 20-byte account address
        * @return non-negative balance, zero if absent
        * @throws RocksDBException on RocksDB errors
        */
        public static BigInteger getBalance(byte[] address) throws RocksDBException {
            Objects.requireNonNull(address, "Address must not be null");
            byte[] data = TREE.getData(address);
            if (data == null || data.length == 0) {
                return BigInteger.ZERO;
            }
            return new BigInteger(1, data);
        }

        /**
        * Sets the balance for the given address.
        *
        * @param address 20-byte account address
        * @param balance non-negative balance
        * @throws RocksDBException on RocksDB errors
        */
        public static void setBalance(byte[] address, BigInteger balance) throws RocksDBException {
            Objects.requireNonNull(address, "Address must not be null");
            Objects.requireNonNull(balance, "Balance must not be null");
            TREE.addOrUpdateData(address, balance.toByteArray());
        }

        /**
        * Transfers amount from sender to receiver.
        *
        * @param sender   sender address
        * @param receiver receiver address
        * @param amount   amount to transfer
        * @return true if transfer succeeded, false on insufficient funds
        * @throws RocksDBException on RocksDB errors
        */
        public static boolean transfer(byte[] sender, byte[] receiver, BigInteger amount) throws RocksDBException {
            Objects.requireNonNull(sender);
            Objects.requireNonNull(receiver);
            Objects.requireNonNull(amount);
            BigInteger senderBal = getBalance(sender);
            if (senderBal.compareTo(amount) < 0) {
                return false;
            }
            setBalance(sender, senderBal.subtract(amount));
            setBalance(receiver, getBalance(receiver).add(amount));
            return true;
        }

        /**
        * @return the last checked block number, or zero if unset
        * @throws RocksDBException on RocksDB errors
        */
        public static long getLastCheckedBlock() throws RocksDBException {
            byte[] bytes = TREE.getData(LAST_CHECKED_BLOCK_KEY);
            return (bytes == null || bytes.length < Long.BYTES)
                    ? 0L
                    : ByteBuffer.wrap(bytes).getLong();
        }

        /**
        * Updates the last checked block number.
        *
        * @param blockNumber non-negative block number
        * @throws RocksDBException on RocksDB errors
        */
        public static void setLastCheckedBlock(long blockNumber) throws RocksDBException {
            ByteBuffer buf = ByteBuffer.allocate(Long.BYTES).putLong(blockNumber);
            TREE.addOrUpdateData(LAST_CHECKED_BLOCK_KEY, buf.array());
        }

        /**
        * Records the Merkle root hash for a specific block.
        *
        * @param blockNumber block height
        * @param rootHash    32-byte Merkle root
        * @throws RocksDBException on RocksDB errors
        */
        public static void setBlockRootHash(long blockNumber, byte[] rootHash) throws RocksDBException {
            Objects.requireNonNull(rootHash, "Root hash must not be null");
            String key = BLOCK_ROOT_PREFIX + blockNumber;
            TREE.addOrUpdateData(key.getBytes(StandardCharsets.UTF_8), rootHash);
        }

        /**
        * Retrieves the Merkle root hash for a specific block.
        *
        * @param blockNumber block height
        * @return 32-byte root hash, or null if absent
        * @throws RocksDBException on RocksDB errors
        */
        public static byte[] getBlockRootHash(long blockNumber) throws RocksDBException {
            String key = BLOCK_ROOT_PREFIX + blockNumber;
            return TREE.getData(key.getBytes(StandardCharsets.UTF_8));
        }
    }
    ```
</TabItem>
</Tabs>

**Key Features:**
- **MerkleTree Integration**: Provides cryptographic state verification through root hashes
- **Atomic Transfers**: Ensures balance consistency during token transfers
- **Block State Management**: Tracks validated states for specific block heights
- **Error Recovery**: Can revert changes when consensus validation fails

### 3. HTTP API Implementation

Create HTTP endpoints for peer communication and state queries.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    // api/get.js
    import DatabaseService from '../databaseService.js';

    export class GET {
        static run(app) {
            app.get('/rootHash', async (req, res) => {
                try {
                    const response = await this.handleRootHash(req.query);
                    
                    if (response === '') {
                        return res.status(500).send('');
                    }
                    
                    if (response.startsWith('Block root hash not found') || 
                        response === 'Invalid block number') {
                        return res.status(400).send(response);
                    }
                    
                    return res.send(response);
                    
                } catch (error) {
                    return res.status(500).send('');
                }
            });
        }

        static async handleRootHash(params) {
            const blockNumberStr = params.blockNumber;
            if (!blockNumberStr) {
                throw new Error('Missing blockNumber parameter');
            }
            
            const blockNumber = parseInt(blockNumberStr, 10);
            if (isNaN(blockNumber)) {
                throw new Error('Invalid block number format');
            }
            
            const lastCheckedBlock = await DatabaseService.getLastCheckedBlock();
            
            if (blockNumber === lastCheckedBlock) {
                const rootHash = await DatabaseService.getRootHash();
                if (rootHash) {
                    return rootHash.toString('hex');
                } else {
                    return '';
                }
            }
            else if (blockNumber < lastCheckedBlock && blockNumber > 1) {
                const blockRootHash = await DatabaseService.getBlockRootHash(blockNumber);
                
                if (blockRootHash !== null) {
                    return blockRootHash.toString('hex');
                } else {
                    return `Block root hash not found for block number: ${blockNumber}`;
                }
            } else {
                return 'Invalid block number';
            }
        }
    }

    export default { GET };
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    # api/get.py
    from flask import Flask, request
    from typing import Optional
    from database_service import DatabaseService, DatabaseServiceError

    # Flask app instance
    app = Flask(__name__)

    def bytes_to_hex_string(data: Optional[bytes]) -> Optional[str]:
        """Convert bytes to hex string"""
        if data is None:
            return None
        return data.hex()

    @app.route('/rootHash', methods=['GET'])
    def root_hash_endpoint():
        """GET /rootHash endpoint"""
        try:
            # Parse blockNumber query parameter
            block_number_str = request.args.get('blockNumber')
            if block_number_str is None:
                return "Missing blockNumber parameter", 400
            
            try:
                block_number = int(block_number_str)
            except ValueError:
                return "Invalid block number format", 400
            
            # Get last checked block for validation
            last_checked_block = DatabaseService.get_last_checked_block()
            
            if block_number == last_checked_block:
                # Return current root hash
                root_hash = DatabaseService.get_root_hash()
                if root_hash is not None:
                    return bytes_to_hex_string(root_hash)
                else:
                    return "Root hash not available", 400
                    
            elif block_number < last_checked_block and block_number > 1:
                # Return historical root hash
                block_root_hash = DatabaseService.get_block_root_hash(block_number)
                if block_root_hash is not None:
                    return bytes_to_hex_string(block_root_hash)
                else:
                    return f"Block root hash not found for block number: {block_number}", 400
            else:
                # Invalid block number
                return "Invalid block number", 400
                
        except DatabaseServiceError:
            return "Database error", 500
        except Exception:
            return "", 500

    def run():
        """Initializes and registers all GET endpoint handlers with Flask"""
        # The route is already registered via the @app.route decorator
        pass

    if __name__ == "__main__":
        app.run(debug=True)
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    // src/api/mod.rs
    use warp::Filter;
    use std::collections::HashMap;
    use crate::database_service::DatabaseService;

    pub struct GET;

    impl GET {
        /// Initializes and registers all GET endpoint handlers with the Warp framework.
        /// Currently registers the /rootHash endpoint for retrieving Merkle root hashes
        /// for specific block numbers.
        pub fn run() -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
            warp::path("rootHash")
                .and(warp::get())
                .and(warp::query::<HashMap<String, String>>())
                .map(|params: HashMap<String, String>| {
                    match Self::handle_root_hash(params) {
                        Ok(response) => response,
                        Err(_) => String::new()
                    }
                })
        }
        
        fn handle_root_hash(params: HashMap<String, String>) -> Result<String, String> {
            let block_number_str = params.get("blockNumber")
                .ok_or("Missing blockNumber parameter")?;
            let block_number: u64 = block_number_str.parse()
                .map_err(|_| "Invalid block number format")?;
            
            let last_checked_block = DatabaseService::get_last_checked_block()
                .map_err(|_| "Database error")?;
            
            if block_number == last_checked_block {
                let root_hash = DatabaseService::get_root_hash()
                    .map_err(|_| "Database error")?;
                match root_hash {
                    Some(hash) => Ok(hex::encode(hash)),
                    None => Ok(String::new())
                }
            } else if block_number < last_checked_block && block_number > 1 {
                let block_root_hash = DatabaseService::get_block_root_hash(block_number)
                    .map_err(|_| "Database error")?;
                
                match block_root_hash {
                    Some(hash) => Ok(hex::encode(hash)),
                    None => Ok(format!("Block root hash not found for block number: {}", block_number))
                }
            } else {
                Ok("Invalid block number".to_string())
            }
        }
    }
    ```
</TabItem>
<TabItem value="go" label="Go">
    ```go
    // api/get.go
    package api

    import (
        "encoding/hex"
        "net/http"
        "strconv"

        "github.com/gin-gonic/gin"
        "pwr-stateful-vida/dbservice"
    )

    func RegisterRoutes(router *gin.Engine) {
        router.GET("/rootHash", func(c *gin.Context) {
            blockNumber, _ := strconv.ParseInt(c.Query("blockNumber"), 10, 64)
            lastCheckedBlock, _ := dbservice.GetLastCheckedBlock()

            if blockNumber == lastCheckedBlock {
                if rootHash, _ := dbservice.GetRootHash(); rootHash != nil {
                    c.String(http.StatusOK, hex.EncodeToString(rootHash))
                    return
                }
            } else if blockNumber < lastCheckedBlock && blockNumber > 1 {
                if blockRootHash, _ := dbservice.GetBlockRootHash(blockNumber); blockRootHash != nil {
                    c.String(http.StatusOK, hex.EncodeToString(blockRootHash))
                    return
                }
                c.String(http.StatusBadRequest, "Block root hash not found for block number: "+c.Query("blockNumber"))
                return
            }

            c.String(http.StatusBadRequest, "Invalid block number")
        })
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    // api/Get.cs
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Builder;

    namespace PwrStatefulVIDA;

    public static class GET
    {
        public static void Run(WebApplication app)
        {
            app.MapGet("/rootHash", async (HttpContext context) =>
            {
                try
                {
                    var response = HandleRootHash(context.Request.Query);
                    await context.Response.WriteAsync(response);
                }
                catch (Exception)
                {
                    await context.Response.WriteAsync("");
                }
            });
        }

        private static string HandleRootHash(IQueryCollection queryParams)
        {
            if (!queryParams.TryGetValue("blockNumber", out var blockNumberStr) || 
                !ulong.TryParse(blockNumberStr, out var blockNumber))
            {
                return "Missing or invalid blockNumber parameter";
            }

            var lastCheckedBlock = DatabaseService.GetLastCheckedBlock();

            if (blockNumber == lastCheckedBlock)
            {
                var rootHash = DatabaseService.GetRootHash();
                return rootHash != null ? Convert.ToHexString(rootHash).ToLowerInvariant() : "";
            }
            else if (blockNumber < lastCheckedBlock && blockNumber > 1)
            {
                var blockRootHash = DatabaseService.GetBlockRootHash(blockNumber);
                
                return blockRootHash != null 
                    ? Convert.ToHexString(blockRootHash).ToLowerInvariant()
                    : $"Block root hash not found for block number: {blockNumber}";
            }
            else
            {
                return "Invalid block number";
            }
        }
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    // api/GET.java
    package api;

    import io.pwrlabs.util.encoders.Hex;
    import main.DatabaseService;

    import static spark.Spark.get;

    public class GET {
        /**
        * Initializes and registers all GET endpoint handlers with the Spark framework.
        * Currently registers the /rootHash endpoint for retrieving Merkle root hashes
        * for specific block numbers.
        */
        public static void run() {
            get("/rootHash", (request, response) -> {
                try {
                    long blockNumber = Long.parseLong(request.queryParams("blockNumber"));

                    if(blockNumber == DatabaseService.getLastCheckedBlock()) return Hex.toHexString(DatabaseService.getRootHash());
                    else if(blockNumber < DatabaseService.getLastCheckedBlock() && blockNumber > 1) {
                        byte[] blockRootHash = DatabaseService.getBlockRootHash(blockNumber);
                        if (blockRootHash != null) {
                            return Hex.toHexString(blockRootHash);
                        } else {
                            response.status(400);
                            return "Block root hash not found for block number: " + blockNumber;
                        }
                    } else {
                        response.status(400);
                        return "Invalid block number";
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    return "";
                }
            });
        }
    }
    ```
</TabItem>
</Tabs>



## Summary of Part 1

In Part 1, we covered the foundational components of a stateful VIDA:

1. Project Setup: Configured dependencies for PWR SDK, HTTP server, and database integration
2. Database Layer: Implemented a MerkleTree-backed service for cryptographic state verification and persistent storage
3. HTTP API: Created endpoints for peer communication and root hash queries

These components provide the infrastructure needed for maintaining and validating persistent state across network participants. In Part 2, we'll implement the transaction processing logic, main application orchestration, and demonstrate how to run the complete stateful VIDA system.

The database layer ensures data integrity through cryptographic verification, while the API layer enables peer consensus validation. Together, they form the foundation for building robust, production-ready stateful applications on the PWR Chain.
