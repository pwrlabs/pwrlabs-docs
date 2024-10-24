---
title: Wrapper Node
sidebar_position: 4
---

# Wrapper Node

Wrapper nodes are a versatile component of the PWR Chain ecosystem that enable various functionalities and enhance the user experience.

## Key Features and Benefits

- **Transaction Fee Abstraction**: Wrapper nodes allow users to pay transaction fees in any supported cryptocurrency, abstracting away the need to hold PWR tokens directly.
- **Custom Transaction Handling**: Wrapper nodes can process custom, non-PWR-native transactions and submit them to the PWR Chain as data transactions, enabling interoperability with other systems, protocols, tools, wallets, and others.
- **Seamless User Experience**: By integrating with popular wallets and interfaces such as Metamask, wrapper nodes provide a familiar and user-friendly experience for interacting with PWR Chain-based applications.
- **Expanded Ecosystem Reach**: Wrapper nodes enable the integration of PWR Chain with existing blockchain ecosystems, such as Ethereum and Bitcoin, allowing users to interact with PWR Chain applications using their preferred wallets and tools.

## Key Use Cases

- **Fee Delegation**: Wrapper nodes can be used to implement fee delegation mechanisms, where the transaction fees are paid by a third party on behalf of the user, enhancing user onboarding and experience.
- **Custom VM Integration**: Wrapper nodes can be utilized by custom virtual machines (VMs) to accept and process transactions in their native format from existing wallets like Metamask, Trustwallet, and others, expanding the possibilities for building specialized applications on PWR Chain.

## Transaction Flow

1. User interacts with a wallet or interface integrated with a wrapper node.
2. The wrapper node receives the transaction request and performs any necessary conversions or translations.
3. The wrapper node submits the transaction to the PWR Chain as a data transaction.
4. The PWR Chain processes the transaction, and the wrapper node relays the result back to the user's wallet or interface.

<img src="/img/tx-processing.avif" />

## Security and Integrity

- Wrapper nodes do not have access to user funds or private keys, ensuring the security of user assets.
- Transactions processed by wrapper nodes are accompanied by the original signatures, allowing for the verification of their integrity and authenticity.

## Conclusion

Wrapper nodes are a powerful tool in the PWR Chain ecosystem, enabling interoperability, fee abstraction, and enhanced user experiences. They play a crucial role in expanding the reach and versatility of PWR Chain, making it accessible and convenient for users across different blockchain ecosystems.
