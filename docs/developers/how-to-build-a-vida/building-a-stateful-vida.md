---
title: Building a Stateful VIDA
sidebar_position: 4
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Building a Stateful VIDA

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

## Steps to Build a Stateful VIDA

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

    def get_root_hash() -> Optional[bytes]:
        """Get current Merkle root hash"""
        try:
            tree = _get_tree()
            return tree.get_root_hash()
        except Exception as e:
            raise DatabaseServiceError(f"Error getting root hash: {str(e)}")

    def flush():
        """Flush pending writes to disk"""
        try:
            tree = _get_tree()
            tree.flush_to_disk()
        except Exception as e:
            raise DatabaseServiceError(f"Error flushing to disk: {str(e)}")

    def revert_unsaved_changes():
        """Reverts all unsaved changes to the Merkle tree"""
        try:
            tree = _get_tree()
            tree.revert_unsaved_changes()
        except Exception as e:
            raise DatabaseServiceError(f"Error reverting changes: {str(e)}")

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

    def transfer(sender: bytes, receiver: bytes, amount: int) -> bool:
        """Transfers amount from sender to receiver"""
        if sender is None:
            raise ValueError("Sender must not be null")
        if receiver is None:
            raise ValueError("Receiver must not be null")
        if amount is None:
            raise ValueError("Amount must not be null")
        
        try:
            sender_balance = get_balance(sender)
            if sender_balance < amount:
                return False
            
            set_balance(sender, sender_balance - amount)
            receiver_balance = get_balance(receiver)
            set_balance(receiver, receiver_balance + amount)
            
            return True
            
        except Exception as e:
            raise DatabaseServiceError(f"Error during transfer: {str(e)}")

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
    // database_service.rs
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
    import sys
    import os
    from typing import Optional

    # Add the src directory to the path to import DatabaseService
    src_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    if src_path not in sys.path:
        sys.path.insert(0, src_path)

    # Import DatabaseService functions
    from database_service import (
        get_root_hash,
        get_last_checked_block, 
        get_block_root_hash,
        DatabaseServiceError
    )

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
            last_checked_block = get_last_checked_block()
            
            if block_number == last_checked_block:
                # Return current root hash
                root_hash = get_root_hash()
                if root_hash is not None:
                    return bytes_to_hex_string(root_hash)
                else:
                    return "Root hash not available", 400
                    
            elif block_number < last_checked_block and block_number > 1:
                # Return historical root hash
                block_root_hash = get_block_root_hash(block_number)
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
    // api/mod.rs
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

### 4. Main Application Logic and Transaction Processing

Implement the core application that subscribes to VIDA transactions and processes them while maintaining state consistency.

<Tabs>
<TabItem value="javascript" label="JavaScript">
    ```js
    // main.js
    import PWRJS from "@pwrjs/core";
    import express from 'express';
    import fetch from 'node-fetch';
    import { GET } from './api/get.js';
    import DatabaseService from './databaseService.js';

    const VIDA_ID = 73746238;
    const START_BLOCK = 1;
    const RPC_URL = "https://pwrrpc.pwrlabs.io/";
    const PORT = 8080;
    const REQUEST_TIMEOUT = 10000;

    const INITIAL_BALANCES = new Map([
        [Buffer.from("c767ea1d613eefe0ce1610b18cb047881bafb829", 'hex'), 1000000000000n],
        [Buffer.from("3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4", 'hex'), 1000000000000n],
        [Buffer.from("9282d39ca205806473f4fde5bac48ca6dfb9d300", 'hex'), 1000000000000n],
        [Buffer.from("e68191b7913e72e6f1759531fbfaa089ff02308a", 'hex'), 1000000000000n],
    ]);

    let pwrjsClient = null;
    let peersToCheckRootHashWith = [];
    let app = null;
    let subscription = null;
    let blockProgressMonitor = null;

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
        
        console.log("Application started successfully. Press Ctrl+C to exit.");
        
        setupShutdownHandlers();
        
        await keepAlive();
    }

    function initializePeers() {
        const args = process.argv.slice(2);
        
        if (args.length > 0) {
            peersToCheckRootHashWith = args;
            console.log("Using peers from args:", peersToCheckRootHashWith);
        } else {
            peersToCheckRootHashWith = [
                "localhost:8080"
            ];
            console.log("Using default peers:", peersToCheckRootHashWith);
        }
    }

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

    async function initInitialBalances() {
        const lastCheckedBlock = await DatabaseService.getLastCheckedBlock();
        
        if (lastCheckedBlock === 0) {
            console.log("Setting up initial balances for fresh database");
            
            for (const [address, balance] of INITIAL_BALANCES) {
                await DatabaseService.setBalance(address, balance);
                console.log(`Set initial balance for ${address.toString('hex')}: ${balance}`);
            }
            
            await DatabaseService.flush();
            console.log("Initial balances setup completed");
        }
    }

    async function subscribeAndSync(fromBlock) {
        console.log(`Starting VIDA transaction subscription from block ${fromBlock}`);
        
        pwrjsClient = new PWRJS(RPC_URL);
        
        subscription = pwrjsClient.subscribeToVidaTransactions(
            VIDA_ID,
            BigInt(fromBlock),
            processTransaction
        );
        
        console.log(`Successfully subscribed to VIDA ${VIDA_ID} transactions`);
        
        startBlockProgressMonitor(fromBlock);
        
        console.log("Block progress monitor started");
    }

    function startBlockProgressMonitor(startBlock) {
        let lastChecked = startBlock;
        
        blockProgressMonitor = setInterval(async () => {
            try {
                const latestChainBlock = await getLatestChainBlock();
                
                if (lastChecked < latestChainBlock) {
                    const nextBlock = Math.min(lastChecked + 1000, latestChainBlock);
                    
                    if (nextBlock > lastChecked) {
                        try {
                            await onChainProgress(nextBlock);
                            lastChecked = nextBlock;
                        } catch (error) {
                            console.error("Error in chain progress:", error);
                        }
                    }
                }
            } catch (error) {
                console.error("Error in block progress monitor:", error);
            }
        }, 5000);
    }

    async function getLatestChainBlock() {
        try {
            const latestBlock = await pwrjsClient.getLatestBlockNumber();
            return Number(latestBlock);
        } catch (error) {
            console.error("Failed to get latest chain block:", error);
            return await DatabaseService.getLastCheckedBlock();
        }
    }

    async function onChainProgress(blockNumber) {
        await DatabaseService.setLastCheckedBlock(blockNumber);
        await checkRootHashValidityAndSave(blockNumber);
        console.log(`Checkpoint updated to block ${blockNumber}`);
        
        await DatabaseService.flush();
    }

    function processTransaction(txn) {
        console.log(`TRANSACTION RECEIVED: ${txn.data}`);
        
        try {
            handleTransaction(txn);
        } catch (error) {
            console.error("Error processing transaction:", error);
        }
    }

    function handleTransaction(txn) {
        const dataBytes = Buffer.from(txn.data, 'hex');
        
        const dataStr = dataBytes.toString('utf8');
        const jsonData = JSON.parse(dataStr);
        
        const action = jsonData.action || "";
        
        if (action.toLowerCase() === "transfer") {
            handleTransfer(jsonData, txn.sender);
        }
    }

    async function handleTransfer(jsonData, senderHex) {
        const amount = BigInt(jsonData.amount || 0);
        const receiverHex = jsonData.receiver || "";
        
        if (amount <= 0 || !receiverHex) {
            console.log("Invalid transfer data:", jsonData);
            return;
        }
        
        const sender = decodeHexAddress(senderHex);
        const receiver = decodeHexAddress(receiverHex);
        
        const success = await DatabaseService.transfer(sender, receiver, amount);
        
        if (success) {
            console.log(`Transfer succeeded: ${amount} from ${senderHex} to ${receiverHex}`);
        } else {
            console.log(`Transfer failed (insufficient funds): ${amount} from ${senderHex} to ${receiverHex}`);
        }
    }

    function decodeHexAddress(hexStr) {
        const cleanHex = hexStr.startsWith("0x") ? hexStr.slice(2) : hexStr;
        return Buffer.from(cleanHex, 'hex');
    }

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
    }

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

    function setupShutdownHandlers() {
        const gracefulShutdown = async (signal) => {
            console.log(`Received ${signal}, shutting down gracefully...`);
            await shutdown();
            process.exit(0);
        };
        
        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);
    }

    async function keepAlive() {
        return new Promise(() => {});
    }

    async function shutdown() {
        console.log("Shutting down application...");
        
        try {
            if (blockProgressMonitor) {
                clearInterval(blockProgressMonitor);
            }
            
            if (subscription) {
                subscription.stop();
            }
            
            await DatabaseService.flush();
            console.log("Flushed database changes");
            
            await DatabaseService.close();
            console.log("Closed database service");
        } catch (error) {
            console.error("Error during shutdown:", error);
        }
        
        console.log("Application shutdown complete");
    }

    main().catch(console.error);
    ```
</TabItem>
<TabItem value="python" label="Python">
    ```py
    # main.py
    import sys
    import json
    import threading
    import time
    import requests
    from pwrpy.pwrsdk import PWRPY
    from pwrpy.models.Transaction import VidaDataTransaction
    from database_service import (
        get_root_hash, get_last_checked_block, set_last_checked_block, 
        set_balance, transfer, set_block_root_hash, revert_unsaved_changes, flush
    )
    from api.get import app as flask_app

    VIDA_ID = 73_746_238
    START_BLOCK = 1
    RPC_URL = "https://pwrrpc.pwrlabs.io/"
    PORT = 8080
    REQUEST_TIMEOUT = 10

    INITIAL_BALANCES = {
        bytes.fromhex("c767ea1d613eefe0ce1610b18cb047881bafb829"): 1_000_000_000_000,
        bytes.fromhex("3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4"): 1_000_000_000_000,
        bytes.fromhex("9282d39ca205806473f4fde5bac48ca6dfb9d300"): 1_000_000_000_000,
        bytes.fromhex("e68191b7913e72e6f1759531fbfaa089ff02308a"): 1_000_000_000_000,
    }

    pwrpy_client = None
    peers_to_check_root_hash_with = []
    subscription = None
    flask_thread = None

    def main():
        print("Starting PWR VIDA Transaction Synchronizer...")
        
        initialize_peers()
        start_flask_server()
        init_initial_balances()
        
        last_block = get_last_checked_block()
        from_block = last_block if last_block > 0 else START_BLOCK
        
        print(f"Starting synchronization from block {from_block}")
        
        subscribe_and_sync(from_block)


    def start_flask_server():
        global flask_thread
        
        def run_flask():
            try:
                print(f"Starting Flask API server on port {PORT}")
                flask_app.run(host='0.0.0.0', port=PORT, debug=False, use_reloader=False)
            except Exception as e:
                print(f"Flask server error: {e}")
        
        flask_thread = threading.Thread(target=run_flask, daemon=True)
        flask_thread.start()
        
        time.sleep(2)
        print(f"Flask API server started on http://0.0.0.0:{PORT}")

    def init_initial_balances():
        if get_last_checked_block() == 0:
            print("Setting up initial balances for fresh database")
            
            for address, balance in INITIAL_BALANCES.items():
                set_balance(address, balance)
                print(f"Set initial balance for {address.hex()}: {balance}")
            
            flush()
            print("Initial balances setup completed")

    def initialize_peers():
        global peers_to_check_root_hash_with
        
        if len(sys.argv) > 1:
            peers_to_check_root_hash_with = sys.argv[1:]
            print(f"Using peers from args: {peers_to_check_root_hash_with}")
        else:
            peers_to_check_root_hash_with = [
                "localhost:8080"
            ]
            print(f"Using default peers: {peers_to_check_root_hash_with}")

    def subscribe_and_sync(from_block):
        global pwrpy_client, subscription
        
        print(f"Starting VIDA transaction subscription from block {from_block}")
        
        pwrpy_client = PWRPY(RPC_URL)
        
        subscription = pwrpy_client.subscribe_to_vida_transactions(
            VIDA_ID,
            from_block,
            process_transaction
        )
        
        print(f"Successfully subscribed to VIDA {VIDA_ID} transactions")
        
        start_block_progress_monitor()

    def start_block_progress_monitor():
        def monitor_blocks():
            last_checked = get_last_checked_block()
            
            while True:
                try:
                    if subscription is None:
                        break
                    
                    current_block = subscription.get_latest_checked_block()
                    
                    if current_block > last_checked:
                        on_chain_progress(current_block)
                        last_checked = current_block
                    
                    time.sleep(5)
                    
                except Exception as e:
                    print(f"Error in block progress monitor: {e}")
                    time.sleep(10)
        
        monitor_thread = threading.Thread(target=monitor_blocks, daemon=True)
        monitor_thread.start()
        print("Block progress monitor started")

    def on_chain_progress(block_number):
        set_last_checked_block(block_number)
        check_root_hash_validity_and_save(block_number)
        print(f"Checkpoint updated to block {block_number}")

    def process_transaction(txn):
        try:
            print(f"TRANSACTION RECEIVED: {txn.data}")
            data_hex = txn.data
            data_bytes = bytes.fromhex(data_hex)
            
            data_str = data_bytes.decode('utf-8')
            json_data = json.loads(data_str)
            
            action = json_data.get('action', '')
            
            if action.lower() == 'transfer':
                handle_transfer(json_data, txn.sender)
                
        except Exception as e:
            print(f"Error processing transaction: {e}")

    def handle_transfer(json_data, sender_hex):
        try:
            amount = int(json_data.get('amount', 0))
            receiver_hex = json_data.get('receiver', '')
            
            if amount <= 0 or not receiver_hex:
                print(f"Invalid transfer data: {json_data}")
                return
            
            sender = decode_hex_address(sender_hex)
            receiver = decode_hex_address(receiver_hex)
            
            success = transfer(sender, receiver, amount)
            
            if success:
                print(f"Transfer succeeded: {amount} from {sender_hex} to {receiver_hex}")
            else:
                print(f"Transfer failed (insufficient funds): {amount} from {sender_hex} to {receiver_hex}")
                
        except Exception as e:
            print(f"Error handling transfer: {e}")

    def decode_hex_address(hex_str):
        clean_hex = hex_str[2:] if hex_str.startswith('0x') else hex_str
        return bytes.fromhex(clean_hex)

    def check_root_hash_validity_and_save(block_number):
        local_root = get_root_hash()
        
        if not local_root:
            print(f"No local root hash available for block {block_number}")
            return
        
        peers_count = len(peers_to_check_root_hash_with)
        quorum = (peers_count * 2) // 3 + 1
        matches = 0
        
        for peer in peers_to_check_root_hash_with:
            success, peer_root = fetch_peer_root_hash(peer, block_number)
            
            if success and peer_root:
                if peer_root == local_root:
                    matches += 1
            else:
                if peers_count > 0:
                    peers_count -= 1
                    quorum = (peers_count * 2) // 3 + 1
            
            if matches >= quorum:
                set_block_root_hash(block_number, local_root)
                print(f"Root hash validated and saved for block {block_number}")
                return
        
        print(f"Root hash mismatch: only {matches}/{len(peers_to_check_root_hash_with)} peers agreed")
        revert_unsaved_changes()

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

    if __name__ == "__main__":
        main()
    ```
</TabItem>
<TabItem value="rust" label="Rust">
    ```rust
    // main.rs
    mod database_service;
    mod api;

    use pwr_rs::{
        RPC,
        transaction::types::VidaDataTransaction,
    };
    use std::sync::Arc;
    use std::env;
    use std::time::Duration;
    use hex;
    use serde_json::{Value, Map};
    use num_bigint::BigUint;
    use tokio::time::sleep;

    use crate::database_service::DatabaseService;
    use crate::api::GET;

    // Constants
    const VIDA_ID: u64 = 73_746_238;
    const START_BLOCK: u64 = 1;
    const RPC_URL: &str = "https://pwrrpc.pwrlabs.io/";
    const PORT: u16 = 8080;

    // Global state
    static mut PEERS_TO_CHECK_ROOT_HASH_WITH: Vec<String> = Vec::new();
    static mut PWR_CLIENT: Option<Arc<RPC>> = None;

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

    /// Sets up the initial account balances when starting from a fresh database
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
            
            // Flush to ensure balances are persisted
            DatabaseService::flush().map_err(|e| format!("Failed to flush database: {:?}", e))?;
            println!("Initial balances setup completed");
        }
        
        Ok(())
    }

    /// Initializes peer list from arguments or defaults
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

    /// Subscribes to VIDA transactions starting from the given block
    async fn subscribe_and_sync(from_block: u64) -> Result<(), Box<dyn std::error::Error>> {
        println!("Starting VIDA transaction subscription from block {}", from_block);
        
        // Initialize RPC client
        let rpc = RPC::new(RPC_URL).await.map_err(|e| format!("Failed to create RPC client: {:?}", e))?;
        let rpc = Arc::new(rpc);
        
        unsafe {
            PWR_CLIENT = Some(rpc.clone());
        }
        
        // Subscribe to VIDA transactions
        let subscription = rpc.subscribe_to_vida_transactions(
            VIDA_ID,
            from_block,
            process_transaction,
        );
        
        println!("Successfully subscribed to VIDA {} transactions", VIDA_ID);
        
        // Start monitoring loop for block progress
        tokio::spawn(async move {
            let mut last_checked = DatabaseService::get_last_checked_block().unwrap_or(0);
            
            loop {
                // Get current latest checked block from subscription
                let current_block = subscription.get_latest_checked_block();
                
                // If block has progressed, trigger validation
                if current_block > last_checked {
                    on_chain_progress(current_block).await;
                    last_checked = current_block;
                }
                
                sleep(Duration::from_secs(5)).await;
            }
        });
        
        println!("Block progress monitor started");
        Ok(())
    }

    /// Callback invoked as blocks are processed
    async fn on_chain_progress(block_number: u64) {
        DatabaseService::set_last_checked_block(block_number).unwrap();
        check_root_hash_validity_and_save(block_number).await;
        println!("Checkpoint updated to block {}", block_number);
    }

    /// Processes a single VIDA transaction
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

    /// Executes a token transfer described by the given JSON payload
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
        let sender = decode_hex_address(sender_hex);
        let receiver = decode_hex_address(receiver_hex);
        
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

    /// Decodes a hexadecimal address into raw bytes
    fn decode_hex_address(hex_str: &str) -> Vec<u8> {
        let clean_hex = if hex_str.starts_with("0x") {
            &hex_str[2..]
        } else {
            hex_str
        };
        hex::decode(clean_hex).unwrap_or_default()
    }

    /// Validates the local Merkle root against peers and persists it if a quorum of peers agree
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
    }

    /// Fetches the root hash from a peer node for the specified block number
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

    async fn shutdown() -> Result<(), Box<dyn std::error::Error>> {
        // Flush any pending database changes
        DatabaseService::flush().map_err(|e| format!("Failed to flush database: {:?}", e))?;
        println!("Flushed database changes");
        Ok(())
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

        // Graceful shutdown
        shutdown().await?;

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
        "encoding/json"
        "fmt"
        "io"
        "math/big"
        "net/http"
        "os"
        "os/signal"
        "strings"
        "syscall"
        "time"

        "github.com/gin-gonic/gin"
        "pwr-stateful-vida/api"
        "pwr-stateful-vida/dbservice"
        "github.com/pwrlabs/pwrgo/rpc"
    )

    // Constants
    const (
        VIDA_ID     = 73746238
        START_BLOCK = 1
        PORT        = 8080
        RPC_URL     = "https://pwrrpc.pwrlabs.io"
    )

    // Global state
    var (
        peersToCheckRootHashWith = []string{"localhost:8080"}
        subscription             *rpc.VidaTransactionSubscription
        rpcClient                *rpc.RPC
    )

    // main is the application entry point for synchronizing VIDA transactions
    func main() {
        fmt.Println("Starting PWR VIDA Transaction Synchronizer...")

        // Initialize peers from command line arguments
        initializePeers()

        // Initialize RPC client
        rpcClient = rpc.SetRpcNodeUrl(RPC_URL)

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

        // Wait for shutdown signal
        waitForShutdown()
    }

    // startAPIServer initializes and starts the HTTP API server
    func startAPIServer() {
        gin.SetMode(gin.ReleaseMode)
        router := gin.New()
        api.RegisterRoutes(router)

        fmt.Printf("Starting HTTP server on port %d\n", PORT)
        router.Run(fmt.Sprintf(":%d", PORT))
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

    // initializePeers initializes peer list from arguments or defaults
    func initializePeers() {
        if len(os.Args) > 1 {
            peersToCheckRootHashWith = os.Args[1:]
            fmt.Printf("Using peers from args: %v\n", peersToCheckRootHashWith)
        } else {
            fmt.Printf("Using default peers: %v\n", peersToCheckRootHashWith)
        }
    }

    // subscribeAndSync subscribes to VIDA transactions starting from the given block
    func subscribeAndSync(fromBlock int) {
        fmt.Printf("Starting VIDA transaction subscription from block %d\n", fromBlock)

        subscription = rpcClient.SubscribeToVidaTransactions(
            VIDA_ID,
            fromBlock,
            processTransaction,
        )

        fmt.Printf("Successfully subscribed to VIDA %d transactions\n", VIDA_ID)

        // Set up block progress monitoring
        go monitorBlockProgress()
        fmt.Println("Block progress monitor started")
    }

    // monitorBlockProgress monitors the subscription progress and handles block checkpoints
    func monitorBlockProgress() {
        ticker := time.NewTicker(5 * time.Second)
        defer ticker.Stop()

        var lastReportedBlock int64 = 0

        for {
            select {
            case <-ticker.C:
                if subscription != nil && subscription.IsRunning() {
                    currentBlock := int64(subscription.GetLatestCheckedBlock())

                    if currentBlock > lastReportedBlock {
                        onChainProgress(currentBlock)
                        lastReportedBlock = currentBlock
                    }
                }
            }
        }
    }

    // onChainProgress callback invoked as blocks are processed
    func onChainProgress(blockNumber int64) {
        dbservice.SetLastCheckedBlock(blockNumber)
        checkRootHashValidityAndSave(blockNumber)
        fmt.Printf("Checkpoint updated to block %d\n", blockNumber)
    }

    // processTransaction processes a single VIDA transaction
    func processTransaction(transaction rpc.VidaDataTransaction) {
        fmt.Printf("TRANSACTION RECEIVED: %s\n", transaction.Data)

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
        sender := decodeHexAddress(senderHex)
        receiver := decodeHexAddress(receiverHex)

        // Execute transfer
        success, _ := dbservice.Transfer(sender, receiver, amount)

        if success {
            fmt.Printf("Transfer succeeded: %s from %s to %s\n", amount, senderHex, receiverHex)
        } else {
            fmt.Printf("Transfer failed (insufficient funds): %s from %s to %s\n", amount, senderHex, receiverHex)
        }
    }

    // decodeHexAddress decodes a hexadecimal address into raw bytes
    func decodeHexAddress(hexAddr string) []byte {
        cleanHex := strings.TrimPrefix(hexAddr, "0x")
        address, _ := hex.DecodeString(cleanHex)
        return address
    }

    // checkRootHashValidityAndSave validates the local Merkle root against peers and persists it if a quorum of peers agree
    func checkRootHashValidityAndSave(blockNumber int64) {
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
    }

    // fetchPeerRootHash fetches the root hash from a peer node for the specified block number
    func fetchPeerRootHash(peer string, blockNumber int64) (bool, []byte) {
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

    // waitForShutdown waits for shutdown signal
    func waitForShutdown() {
        fmt.Println("Application started successfully. Press Ctrl+C to exit.")

        c := make(chan os.Signal, 1)
        signal.Notify(c, os.Interrupt, syscall.SIGTERM)
        <-c

        fmt.Println("Shutting down application...")

        // Stop subscription
        if subscription != nil {
            subscription.Stop()
        }

        // Flush any pending database changes
        dbservice.Flush()
        fmt.Println("Flushed database changes")

        fmt.Println("Application shutdown complete")
    }
    ```
</TabItem>
<TabItem value="csharp" label="C#">
    ```csharp
    // Program.cs
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Numerics;
    using System.Text;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Builder;
    using Newtonsoft.Json.Linq;
    using PWR;
    using PWR.Models;
    using PWR.Utils;

    namespace PwrStatefulVIDA;

    public class Program
    {
        // Constants
        private const ulong VIDA_ID = 73746238;
        private const ulong START_BLOCK = 1;
        private const string RPC_URL = "https://pwrrpc.pwrlabs.io/";
        private const int PORT = 8080;
        
        // Initial balances for fresh database
        private static readonly Dictionary<byte[], BigInteger> INITIAL_BALANCES = new()
        {
            { Convert.FromHexString("c767ea1d613eefe0ce1610b18cb047881bafb829"), new BigInteger(1000000000000) },
            { Convert.FromHexString("3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4"), new BigInteger(1000000000000) },
            { Convert.FromHexString("9282d39ca205806473f4fde5bac48ca6dfb9d300"), new BigInteger(1000000000000) },
            { Convert.FromHexString("e68191b7913e72e6f1759531fbfaa089ff02308a"), new BigInteger(1000000000000) },
        };

        // Global state
        private static List<string> peersToCheckRootHashWith = new();
        private static RPC? pwrClient;
        private static VidaTransactionSubscription? subscription;
        private static Timer? blockProgressMonitor;

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
            
            await SubscribeAndSync(fromBlock);
            
            Console.WriteLine("Application started successfully. Press Ctrl+C to exit.");
            
            Console.CancelKeyPress += (sender, e) =>
            {
                e.Cancel = true;
                Environment.Exit(0);
            };
            
            await Task.Delay(Timeout.Infinite);
        }

        private static void InitializePeers(string[] args)
        {
            if (args.Length > 0)
            {
                peersToCheckRootHashWith = args.ToList();
                Console.WriteLine($"Using peers from args: [{string.Join(", ", peersToCheckRootHashWith)}]");
            }
            else
            {
                peersToCheckRootHashWith = new List<string> { "localhost:8080" };
                Console.WriteLine($"Using default peers: [{string.Join(", ", peersToCheckRootHashWith)}]");
            }
        }

        private static async Task StartApiServer()
        {
            var builder = WebApplication.CreateBuilder();
            builder.WebHost.UseUrls($"http://0.0.0.0:{PORT}");
            
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

                DatabaseService.Flush();
                Console.WriteLine("Initial balances setup completed");
            }
        }

        private static async Task SubscribeAndSync(ulong fromBlock)
        {
            Console.WriteLine($"Starting VIDA transaction subscription from block {fromBlock}");

            pwrClient = new RPC(RPC_URL);

            subscription = pwrClient.SubscribeToVidaTransactions(
                VIDA_ID,
                fromBlock,
                ProcessTransaction
            );

            Console.WriteLine($"Successfully subscribed to VIDA {VIDA_ID} transactions");

            StartBlockProgressMonitor(fromBlock);
            Console.WriteLine("Block progress monitor started");
        }

        private static void StartBlockProgressMonitor(ulong startBlock)
        {
            ulong lastChecked = startBlock;

            blockProgressMonitor = new Timer(async _ =>
            {
                try
                {
                    var currentBlock = subscription?.GetLatestCheckedBlock() ?? DatabaseService.GetLastCheckedBlock();

                    if (currentBlock > lastChecked)
                    {
                        await OnChainProgress(currentBlock);
                        lastChecked = currentBlock;
                    }
                }
                catch (Exception error)
                {
                    Console.WriteLine($"Error in block progress monitor: {error.Message}");
                }
            }, null, TimeSpan.Zero, TimeSpan.FromSeconds(5));
        }

        private static async Task OnChainProgress(ulong blockNumber)
        {
            DatabaseService.SetLastCheckedBlock(blockNumber);
            await CheckRootHashValidityAndSave(blockNumber);
            Console.WriteLine($"Checkpoint updated to block {blockNumber}");
            DatabaseService.Flush();
        }

        private static void ProcessTransaction(VidaDataTransaction txn)
        {
            Console.WriteLine($"TRANSACTION RECEIVED: {txn.Data}");

            try
            {
                HandleTransaction(txn);
            }
            catch (Exception error)
            {
                Console.WriteLine($"Error processing transaction: {error.Message}");
            }
        }

        private static void HandleTransaction(VidaDataTransaction txn)
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

            var sender = DecodeHexAddress(senderHex);
            var receiver = DecodeHexAddress(receiverHex);

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

        private static byte[] DecodeHexAddress(string hexStr)
        {
            var cleanHex = hexStr.StartsWith("0x") ? hexStr[2..] : hexStr;
            return PWR.Utils.Extensions.HexStringToByteArray(cleanHex);
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
        }

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
    }
    ```
</TabItem>
<TabItem value="java" label="Java">
    ```java
    // Main.java
    package main;

    import api.GET;
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
    import java.util.List;
    import java.util.Objects;
    import java.util.logging.Level;
    import java.util.logging.Logger;

    import static spark.Spark.port;

    /**
    * Entry point for synchronizing VIDA transactions with the local Merkle-backed database.
    */
    public final class Main {
        private static final Logger LOGGER = Logger.getLogger(Main.class.getName());
        private static final long VIDA_ID = 73_746_238L;
        private static final long START_BLOCK = 1L;
        private static final PWRJ PWRJ_CLIENT = new PWRJ("https://pwrrpc.pwrlabs.io/");
        private static final int PORT = 8080;
        private static List<String> peersToCheckRootHashWith;
        private static VidaTransactionSubscription subscription;
        private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();
        private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(10);

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
                subscribeAndSync(fromBlock);
            } catch (IOException | RocksDBException e) {
                LOGGER.log(Level.SEVERE, "Initialization failed", e);
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
        * Subscribes to VIDA transactions starting from the given block.
        *
        * @param fromBlock block height to begin synchronization from
        * @throws IOException if network communication fails
        * @throws RocksDBException if persisting data fails
        */
        private static void subscribeAndSync(long fromBlock) throws IOException, RocksDBException {
            //The subscription to VIDA transactions has a built in shutdwown hook
            subscription =
                    PWRJ_CLIENT.subscribeToVidaTransactions(
                            PWRJ_CLIENT,
                            VIDA_ID,
                            fromBlock,
                            Main::onChainProgress,
                            Main::processTransaction
                    );
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

            byte[] sender = decodeHexAddress(senderHex);
            byte[] receiver = decodeHexAddress(receiverHex);

            boolean success = DatabaseService.transfer(sender, receiver, amount);
            if (success) {
                LOGGER.info("Transfer succeeded: " + json);
            } else {
                LOGGER.warning("Transfer failed (insufficient funds): " + json);
            }
        }

        /**
        * Decodes a hexadecimal address into raw bytes.
        *
        * @param hex hexadecimal string, optionally prefixed with {@code 0x}
        * @return 20-byte address
        */
        private static byte[] decodeHexAddress(String hex) {
            String clean = hex.startsWith("0x") ? hex.substring(2) : hex;
            return Hex.decode(clean);
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
                int peersCount = peersToCheckRootHashWith.size();
                long quorum = (peersCount * 2) / 3 + 1;
                int matches = 0;
                for (String peer : peersToCheckRootHashWith) {
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

                LOGGER.severe("Root hash mismatch: only " + matches + "/" + peersToCheckRootHashWith.size());
                //Revert changes and reset block to reprocess the data
                DatabaseService.revertUnsavedChanges();
                subscription.setLatestCheckedBlock(DatabaseService.getLastCheckedBlock());
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "Error verifying root hash at block " + blockNumber, e);
            }
        }

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
    }
    ```
</TabItem>
</Tabs>


### 5. Run the project

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
    go run main.go
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


### 6. Transaction Data Structure

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
