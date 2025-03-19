---
title: Gossip of Power
sidebar_position: 3
---

# Gossip of Power

A gossip protocol is a way for nodes in a network to efficiently share information with each other by having each node pass along messages to a subset of its peers, similar to how rumors spread through social networks. This allows information to quickly propagate throughout the entire network in a decentralized manner without relying on a central authority.

PWR Chain employs a simple, yet effective gossip protocol called "Gossip of Power" to ensure efficient and reliable communication between validator nodes. This protocol enables validators to share critical information, such as blocks and block approving signatures, with the entire network in a decentralized manner.

## How it Works

In the Gossip of Power protocol, all validators share everything with each other, creating a highly interconnected network. The communication between validators is facilitated through two main channels:
1. TCP (Transmission Control Protocol): TCP is used for sharing blocks among validators. TCP provides a reliable, ordered, and error-checked delivery of data, ensuring that blocks are transmitted accurately and completely.
2. UDP (User Datagram Protocol): UDP is used for sharing block approving signatures. UDP is a lightweight, connectionless protocol that allows for fast and efficient broadcasting of signatures across the network.

## Message Integrity and Efficiency

To ensure message integrity and prevent unnecessary processing, every message sent between validator nodes, whether over UDP or TCP, starts with a unique hash value called the "message hash." This hash serves as a fingerprint for the message and allows validators to quickly identify and filter out duplicate or previously received messages.

When a validator receives a message, it follows these steps:

1. **Hash Check**: The validator first reads the message hash and checks if it has been received before. If the hash is already marked as received, the validator ignores the message, saving processing power and network bandwidth.
2. **Hash Validation**: If the hash is new, the validator accepts the message and calculates the hash independently to verify its accuracy. This step ensures that the message has not been tampered with during transmission.
3. **Message Processing**: If the calculated hash matches the received hash, the validator proceeds to process the message according to its contents (e.g., adding a block to the blockchain or considering a block approving signature).
4. **Message Propagation**: After processing the message, if the content is valid and relevant (e.g., a valid block or a valid block approving signature), the validator shares it with other validators in the network.
5. **Hash Marking**: Finally, the validator marks the message hash as received to prevent future duplicate processing.

## Benefits of Gossip of Power

The Gossip of Power protocol brings several benefits to PWR Chain:

- **Decentralization**: By enabling all validators to share information with each other, the protocol maintains a high level of decentralization, ensuring that no single validator has control over the flow of information.
- **Fault Tolerance**: The gossip protocol is resilient to node failures and network disruptions. Even if some validators are offline or unreachable, the information can still propagate through the network, maintaining network stability.
- **Scalability**: As the number of validators grows, the Gossip of Power protocol allows for efficient dissemination of information without overburdening the network. The hash-based filtering mechanism prevents unnecessary message duplication and processing.
- **Efficiency**: By using UDP for sharing block approving signatures, PWR Chain optimizes network bandwidth usage and reduces latency, enabling faster consensus and block confirmation times.

In summary, the Gossip of Power protocol is a cornerstone of PWR Chain's architecture, ensuring reliable, efficient, and decentralized communication between validators. This protocol contributes to the overall security, scalability, and performance of the PWR Chain network.