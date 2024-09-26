---
title: Easy Write Easy Read Blocks
sidebar_position: 2
---

# Easy Write Easy Read Blocks

`Efficient Block Encoding and Decoding`

EWER (Easy Write Easy Read) is an algorithm developed by the PWR team to optimize the encoding and decoding of blocks in the PWR Chain blockchain. As blocks are the fundamental units of data in a blockchain, efficiently processing them is crucial for maintaining optimal network performance. EWER ensures that blocks can be quickly and easily encoded for network transmission and decoded for block validation and data retrieval.

## Block Structure

In PWR Chain, each block is represented as a byte array, following a predefined structure:

- Previous Block Hash (32 bytes)
- Block Number (8 bytes)
- Blockchain Version (4 bytes)
- Timestamp (8 bytes)
- Transactions Count Identifier (4 bytes)
- Validator Signature Count Identifier (4 bytes)
- Transactions (variable size)
    - Transaction Length (4 bytes)
    - Transaction Data (variable size)
- Submitter Signature (x bytes)
- Validator Signatures (x bytes each)

This structure allows for efficient encoding and decoding of blocks, as the position and size of each data element are known in advance.

## Encoding

### Process

The encoding process in EWER is designed to be simple and efficient. It involves the following steps:

1. Allocate a byte array with the appropriate size based on the block's contents.
2. Write the block data into the buffer in the predefined order:
    - Previous Block Hash
    - Block Number
    - Blockchain Version
    - Timestamp
    - Transactions Count Identifier
    - Validator Signature Count Identifier
    - Transactions (with length prefix for each transaction)
    - Submitter Signature
    - Validator Signatures
3. Return the resulting byte array.

By using a fixed structure and direct byte-level operations, EWER minimizes the overhead associated with encoding blocks.

### Encoding Time Complexity

1. **Fixed-Size Components Encoding**: The encoding of fixed-size components (Previous Block Number, Previous Block Hash, Blockchain Version, Timestamp, Submitter Signature) is a constant-time operation, `( O(1) )`, as each component's size is constant and independent of the size of the block or the number of transactions and signatures.
2. **Validator Signatures Encoding**: This step involves iterating over a list of validator signatures and appending each to the block. If there are `( V )` validator signatures, and each signature is a fixed size, this operation is `( O(V) )`.
3. **Transactions Encoding**: Similar to validator signatures, each transaction is preceded by a 2-byte integer indicating its size. If there are `( T )` transactions, the complexity of this step is `( O(T) )`, assuming the process of appending each transaction is constant time.

Overall, the encoding time complexity would be `( O(V + T) )`, dominated by the number of validator signatures and transactions.

### Encoding Benchmark

The following benchmark was ran on one of our team members PC, and used only 1 thread with a base speed of `2.2 GHZ` and max turbo speed of 4.1 GHZ. The benchmark encodes a 50 MB blocks holding 400 Validator Signatures and 500K transactions.

`Mode Cnt Score Error Units avgt 5 15689.136 ± 2739.039 us/op`

On average, EWER Encoding was capable of encoding a 50MB block holding 500k transactions in 15.6 Milliseconds.

## Decoding

### Process

1. Decoding blocks in EWER is just as straightforward as encoding them. The process follows these general steps:
    - Read the block data from the byte array in the same order as the encoding process:
    - Read the Previous Block Hash.
    - Read the Block Number.
    - Read the Blockchain Version.
    - Read the Timestamp.
    - Read the Transactions Count.
    - Read the Validator Signature Count.
    - Read the Transactions, using the transaction length to determine the size of each transaction.
    - Read the Submitter Signature.
    - Read the Validator Signatures.
2. Store the decoded data in an appropriate data structure, such as a map or object.
3. Return the resulting data structure containing the block's data.

By leveraging the fixed structure of the block, EWER can efficiently extract the required information without unnecessary overhead.

### Time Complexity

1. **Fixed-Size Components Decoding**: This is a constant-time operation ( O(1) ) since each component has a fixed size.
2. **Validator Signatures Decoding**: This involves reading and processing ( V ) validator signatures, each of a fixed size. Therefore, this step has a complexity of ( O(V) ).
3. **Transactions Decoding**: Here, each of the ( T ) transactions is decoded by first reading its size and then extracting the transaction data. Assuming the size read and data extraction operations are constant time for each transaction, this step also has a complexity of ( O(T) ).

Thus, the decoding time complexity is also `( O(V + T) )`, dependent on the number of validator signatures and transactions.

## Benchmark

The following benchmark was ran on one of our team members PC, and used only 1 thread with a base speed of 2.2 GHZ and max turbo speed of 4.1 GHZ The benchmark decodes a 50 MB block holding 400 Validator Signatures and 500k transactions.

`Mode Cnt Score Error Units avgt 5 54.696 ± 1.818 us/op`

On Average, EWER Decoding was capable of decoding a 50MB blocks holding 500K transactions in 0.054 Milliseconds. In other words, EWER Decoding is capable of decoding 18,518 such big blocks in 1 second.

Such decoding speeds are essential in a distributed blockchain system to ensure fast verification of the block by other validators