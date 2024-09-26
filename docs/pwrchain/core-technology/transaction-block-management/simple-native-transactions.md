---
title: Simple Native Transactions
sidebar_position: 1
---

# Simple Native Transactions

`PWR Chain's Transaction Encoding & Decoding Algorithm`

In blockchain networks, transactions are the most recurring and crucial operations. Efficiently handling these transactions is essential for maintaining healthy network performance and scalability. PWR Chain introduces the Simple Native Transactions (SNT) algorithm, designed to optimize the encoding and decoding of transactions, ensuring fast and reliable processing of a wide variety of transaction types.

## Transaction Encoding

### How it Works?

SNT uses a simple and effective approach to encode transactions. Each transaction is represented as a byte array, with a predefined structure that varies based on the transaction type. The first byte of the array serves as an identifier, indicating the type of transaction, followed by the chain ID which indicates the blockchain the transaction is meant for. The remaining bytes contain the transaction details, arranged in a specific order.

The encoding process involves converting the transaction details into their byte array representation. This process is straightforward and efficient, as it follows a fixed structure for each transaction type. For example, a transfer transaction might be encoded as follows:

- Identifier (1 byte)
- ChainId (1 byte)
- Nonce (4 bytes)
- Amount (8 bytes)
- Recipient (20 bytes)

### Encoding Time Complexity

The encoding process in SNT is designed to be efficient and straightforward. By using a predefined structure for each transaction type, SNT minimizes the computational overhead required for encoding. The process involves simple byte-level operations, such as copying transaction details into specific positions within the byte array. As a result, the time complexity of encoding transactions in SNT is O(1), meaning it takes a constant amount of time regardless of the transaction size or network load.

## Transaction Decoding

### How it Works?

Decoding transactions is the process of interpreting the byte array representation back into the original transaction details. SNT makes this process efficient by leveraging the predefined structure of each transaction type.

The decoding process starts by reading the first byte of the array, which identifies the transaction type. Based on this identifier, SNT can quickly determine the structure of the remaining data and extract the relevant information using bitwise operations and array copying.

For instance, decoding a transfer transaction would involve extracting the nonce, amount, and recipient from their respective positions in the byte array.

### Decoding Performance

The efficiency of SNT's decoding process is crucial for handling a high volume of transactions. By using bitwise operations and fixed-size array copying, SNT achieves a constant time complexity O(1) for decoding transactions, regardless of the transaction size.

In benchmark tests performed on a single thread, SNT demonstrated the ability to decode over 71 million transactions per second. This impressive performance highlights the algorithm's scalability and its capability to handle the ever-growing demands of a blockchain network.
