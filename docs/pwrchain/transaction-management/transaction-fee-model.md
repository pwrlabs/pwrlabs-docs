---
title: Transaction Fee Model
sidebar_position: 2
---

# Transaction Fee Model

Since PWR Chain is not a smart contract platform, transaction fees are primarily determined by the size of the transaction and the signature scheme used. The total transaction fee is calculated as follows:

**`Transaction Fee = (Fee Per Byte × Transaction Size) + Signature Verification Fee`**

1. **Fee Per Byte**

    - Reflects the cost per byte of data within a transaction.
    - The exact base value is determined before PWR Chain’s mainnet launch.
    - In case of congestion, users can choose to pay a higher rate to prioritize their transactions.

2. **Signature Verification Fee**

    - Represents the computational effort required to verify a signature.
    - Because PWR Chain supports multiple signature schemes—each varying in complexity—the fee differs accordingly.
    - Each fee amount is predefined based on how much processing power is required to verify a given signature type.

This structure allows PWR Chain to accurately attribute costs to the resources consumed, ensuring that network participants pay fees commensurate with the complexity and size of their transactions.
