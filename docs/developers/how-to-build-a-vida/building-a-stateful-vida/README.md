---
title: Building a Stateful VIDA
sidebar_position: 1
---

# Building a Stateful VIDA

Stateful Verifiable Immutable Data Applications (VIDAs) are designed for scenarios where data integrity, consistency, and auditability are paramount. Unlike stateless VIDAs, which prioritize simplicity and speed, stateful VIDAs maintain a synchronized state across all execution instances by validating historical transactions and leveraging cryptographic proofs. This makes them ideal for mission-critical applications such as financial systems, supply chain management, or enterprise resource planning.

While the foundational steps for building a stateful VIDA mirror those of a stateless VIDA—such as defining a VIDA ID, integrating the PWR SDK, and interacting with the PWR Chain—stateful VIDAs introduce additional mechanisms to ensure reliable execution and verifiable consistency. Below, we outline the core principles that differentiate stateful VIDAs.

## Key Characteristics of Stateful VIDAs

**1. State Initialization & Progress Tracking**

Stateful VIDAs begin processing transactions from a specific block height (e.g., the genesis block or a predefined checkpoint). This ensures the VIDA captures every relevant transaction from the start of its operational timeline. As the VIDA processes transactions, it continuously saves its progress (e.g., the latest block processed) and application state (e.g., user balances, inventory levels) to local storage.

- **Why This Matters:**
    - Enables the VIDA to resume seamlessly after interruptions.
    - Ensures all execution instances process the same transaction history, eliminating gaps or inconsistencies.

**2. Local State Management**

Stateful VIDAs store their application state locally on the machines of all the execution instances and conduit nodes. This state is derived entirely from on-chain transactions and can be recreated at any time by replaying the VIDA's logic against the PWR Chain ledger.

- **Why This Matters:**
    - Avoids reliance on centralized servers or trusted third parties.
    - Allows execution instances to independently verify results by reprocessing transactions from scratch.

**3. Root Hashes for Cross-Validation**

To ensure consistency across execution instances, stateful VIDAs generate root hashes (e.g., Merkle roots) of their stored data after processing transactions after every block. These hashes are agreed on and published to the PWR Chain by Conduit Nodes, or cross-validated across execution instances, creating a tamper-proof record of the VIDA's state after every block.

- **Why This Matters:**
    - **Consistency Checks:** VIDA Execution Instances and Conduit Nodes compare their root hashes to detect discrepancies.
    - **Auditability:** Anyone can verify that an VIDA's state matches the transactions recorded on PWR Chain.

## Ensuring Trustless Consistency

Stateful VIDAs implement two critical safeguards to maintain integrity:

**1. Cross-Instance Validation:**

Multiple Execution Instances of the same VIDA share and validate their root hashes after every block (If the block held transactions relevant to the VIDA). If discrepancies arise, the majority state (as proven by on-chain root hashes) is accepted as valid.

**2. Conduit Node Oversight:**

For critical workflows, Conduit Nodes can act as decentralized auditors. They validate root hashes, publish consensus-approved states to PWR Chain.

## Use Cases for Stateful VIDAs

- **Financial Systems:** Track balances, process payments, and enforce compliance with immutable audit trails.
- **Supply Chain Management:** Monitor goods from production to delivery, with verifiable timestamps and state transitions.
- **Enterprise Operations:** Manage HR records, inventory, or customer data while retaining full auditability.

## Upgrade Management

Stateful VIDAs require careful version control to preserve backward compatibility. Upgrades must either:

- Maintain support for processing historical transactions using legacy logic.
- Include a migration mechanism that updates the state while retaining its verifiable link to past data.

Conduit Nodes often govern upgrades through on-chain voting, ensuring decentralized consensus before changes take effect.

## Next Steps

While this guide focuses on conceptual foundations, future resources will include:

- **Video Tutorials:** Step-by-step walkthroughs for designing and deploying stateful VIDAs.
- **Code Examples:** Templates for root hash generation, cross-validation, and Conduit Node integration.

By combining PWR Chain’s immutable ledger with robust state management, stateful VIDAs empower developers to build decentralized applications that are as reliable as traditional enterprise software—but with unmatched transparency and security.
