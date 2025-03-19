---
title: Architecture
sidebar_position: 2
---

# Architecture

PWR Chain’s architecture is designed to empower **Verifiable Immutable Data Applications (VIDAs)**—applications that combine the flexibility of traditional software with blockchain’s trust and transparency. Below, we explain how the system works and why it’s built this way.

## Overview: Separation of Concerns

PWR Chain separates two critical functions:

1. **The Blockchain aka PWR Chain (Consensus + Data)**: Securely records what happened (transactions).
2. **Verifiable Immutable Data Applications (VIDA)**: Determines how to respond (processing logic).

**Why?**

By isolating consensus from execution, PWR Chain avoids bottlenecks (like Ethereum’s gas limits) while VIDAs operate independently. This lets developers build scalable apps without congesting the blockchain.

<img src="/img/architecture.webp" />

## Core Components

### PWR Chain

- **Role**: A decentralized, immutable ledger for recording action requests and data.
- **Key Features**:
  - **NIST-standardized Post-Quantum Consensus**: Uses Falcon signatures (a NIST-standardized lattice-based scheme) to secure against future attacks.
  - **Immutable Records**: Transactions are timestamped and cannot be altered.

**Why This Design?**

- **Efficiency**: PWR Chain focuses solely on ordering and securing transactions—not executing complex logic. This specialization allows it to process thousands of transactions per second.
- **Future-Proofing**: Resistance to quantum computing threats, protecting long-term data integrity.

### Verifiable Immutable Data Applications

- **Role**: VIDAs are programs that read transactions from PWR Chain and process them off-chain.
- **Key Features**:
  - **Off-Chain Execution**: VIDAs run on any machine (laptop, cloud server) using familiar languages like Python or Java.
  - **State Independence**: Each VIDA manages its own data (e.g., user balances, game scores).
  - **Open Verification**: Anyone can rerun the VIDA to validate results against PWR Chain’s ledger.

**Why This Design?**

- **Scalability**: VIDAs process data outside the blockchain, avoiding network congestion.
- **Flexibility**: Developers aren’t limited by blockchain-specific languages (e.g., Solidity) or gas fees.
- **Cost Efficiency**: Enterprises avoid expensive blockchain infrastructure; VIDAs can run on existing servers.

**Example: Supply Chain VIDA**

1. Factories write `shipment_start` transactions to PWR Chain.
2. The VIDA reads these transactions and calculates delivery timelines.
3. Retailers verify results by rerunning the VIDA.

### Networking & Communication

- **PWR Chain Nodes**: Decentralized and immutable network that propagates transactions globally.
- **Conduit Nodes**: Specialized nodes that relay messages between VIDAs via PWR Chain (learn more in Conduit Nodes).

**Why This Design?**

- **Decentralization**: No single point of failure—transactions are broadcast peer-to-peer.
- **Trustless Interoperability**: Conduit Nodes use PWR Chain as a neutral message bus, ensuring VIDA interactions are tamper-proof.

### Storage

- **PWR Chain**: Stores all transaction requests permanently (immutable ledger).
- **VIDAs**: Store application states externally (e.g., local databases, cloud storage).

**Why This Design?**

- **Cost Reduction**: Storing large datasets (e.g., user profiles) on-chain is expensive. VIDAs handle this off-chain.
- **Performance**: Databases optimized for specific use cases (e.g., SQL for analytics) outperform blockchain storage.

## How Transactions Flow

**Rule: All State-Changing Actions Start on PWR Chain**

Every action that alters a VIDA's state (e.g., updating a balance) begins as a transaction on PWR Chain.

**Why?**

- **Auditability**: Immutable records allow anyone to verify what happened and when.
- **Decentralization**: No central authority controls action requests—they’re validated by the network.

### Step-by-Step Workflow

1. **Submit a Request:**

  - A user sends a transaction with:
    - **`VIDA_ID`**: An 8-byte identifier (e.g., `0x1a3f7e2d`) to target the VIDA.
    - **`Action`**: The request payload (e.g., `{"type": "redeem_points", "user": "Alice"}`).

2. **Consensus Finalization:**
  - Validators order transactions into blocks using fee-based prioritization.

3. **VIDA Processing:**
  - The VIDA filters transactions by its `VIDA_ID` and processes them.
```javascript
# Example: Process loyalty points
transactions = pwr_chain.get_transactions(vida_id="0x1a3f7e2d")
for tx in transactions:
    if tx["action"] == "redeem_points":
        deduct_points(tx["user"], tx["points"])
```

  - **Why Off-Chain?** Complex logic (e.g., AI, real-time analytics) would overload the blockchain.

## Cross-VIDA Communication

VIDAs interact by sending transactions through PWR Chain:

1. **Request Relay**: VIDA A sends a transaction (e.g., `{"type": "payment_complete"}`) to VIDA B’s `VIDA_ID`.
2. **Processing**: VIDA B reads the transaction and updates its state.

**Why Use PWR Chain as a Middleman?**

- **Trustlessness**: Transactions are validated by the network, eliminating reliance on third-party APIs.
- **Immutability**: Requests can’t be altered or censored.

## Security

### PWR Chain

- **Post-Quantum Signatures**: Secures validator votes and transactions.
- **Staking Slashing**: Validators lose staked PWR Coin for malicious acts.

**Why These Choices?**

- **Quantum Resistance**: Protects against future attacks that could break classical cryptography.
- **Incentive Alignment**: Validators are financially motivated to act honestly.

### Verifiable Immutable Data Applications (VIDAs)

- **Replayability**: Since all inputs come from PWR Chain, anyone can reproduce a VIDA’s state.

- **Optional Safeguards**:
  - **Cross-Validation**: Nodes running the same VIDA compare results to detect fraud.
  - **Open-Source Rules**: Most VIDAs publish code for community audits.

**Why Replayability Matters?**

**Trust Minimization**: Users don’t need to rely on the results from a third party—they can independently run the VIDA themselves to extract data from the blockchain and compute the results.

## Scalability

### Horizontal Scaling

- **Unlimited VIDAs**: Add apps without impacting PWR Chain’s performance.
  - **Why?** VIDAs process data off-chain; their workloads don’t compete for resources.
- **Parallel Execution**: Each VIDA runs independently (no shared resources).

### Enterprise-Grade Performance

- **Burst Capacity**: Handle traffic spikes (e.g., holiday sales) by scaling VIDA servers.
  - **Why?** Execution is decoupled from consensus—scale servers without blockchain upgrades.
- **Legacy Integration**: Connect VIDAs to ERP/CRM systems via APIs.

## Why This Architecture Works

### For Developers

- **No Blockchain Expertise**: Build VIDAs with existing tools (Python, Java).
- **No Gas Fees**: Off-chain execution avoids Ethereum-style congestion.

### For Enterprises

- **Auditability**: Every action is timestamped and immutable (simplifies compliance).
- **Cost Savings**: Avoid maintaining custom blockchain nodes.

### For Users

- **Transparency**: Verify results by rerunning the VIDA.

## Traditional Systems vs. PWR Chain

| Aspect              | Traditional Apps                          | PWR Chain + VIDAs                            |
|---------------------|-----------------------------------------|---------------------------------------------|
| **Data Integrity**  | Trusted third-party audits.            | Immutable ledger + replayable VIDAs.       |
| **Scalability**     | Limited by server capacity.            | Scale infinitely with parallel VIDAs.      |
| **Development Cost**| High (custom infra, audits).           | Low (leverage PWR Chain’s Infrastructure). |

This architecture ensures PWR Chain remains lightweight and secure, while VIDAs handle complex logic off-chain. By explaining the "why" behind each design choice, we empower developers and enterprises to build trustless, scalable solutions.
