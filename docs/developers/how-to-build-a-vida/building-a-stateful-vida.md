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

**pom.xml:**
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

**Key Dependencies Explained:**
- **pwrj**: The PWR SDK for Java, providing blockchain connectivity and MerkleTree database
- **spark-core**: Lightweight HTTP framework for creating API endpoints

### 2. Database Layer Implementation

Create a singleton service for managing persistent state using RocksDB with MerkleTree for cryptographic verification.

**DatabaseService.java:**
```java
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

**Key Features:**
- **MerkleTree Integration**: Provides cryptographic state verification through root hashes
- **Atomic Transfers**: Ensures balance consistency during token transfers
- **Block State Management**: Tracks validated states for specific block heights
- **Error Recovery**: Can revert changes when consensus validation fails

### 3. Main Application Logic and Transaction Processing

Implement the core application that subscribes to VIDA transactions and processes them while maintaining state consistency.

**Main.java:**
```java
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
                    "peer1.example.com",
                    "peer2.example.com",
                    "peer3.example.com"
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
            LOGGER.info("Processing transaction: " + json);
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
}
```

### 4. Peer Communication and Consensus

Implement the consensus mechanism that validates state consistency across network participants.

**Consensus Validation Logic (continued in Main.java):**
```java
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
```

**Consensus Features:**
- **Byzantine Fault Tolerance**: Requires 2/3 + 1 peer agreement
- **Automatic Recovery**: Reverts state when consensus fails
- **Network Resilience**: Handles peer failures gracefully

### 5. HTTP API Implementation

Create HTTP endpoints for peer communication and state queries.

**api/GET.java:**
```java
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

### 6. Transaction Data Structure

Define the JSON schema for your stateful VIDA transactions:

**Transfer Transaction Example:**
```json
{
    "action": "transfer",
    "receiver": "0x3b4412f57828d1ceb0dbf0d460f7eb1f21fed8b4",
    "amount": 1000000
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
