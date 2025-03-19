---
title: Conduits Node
sidebar_position: 3
---

# Conduits Node

Conduit Nodes are specialized network participants that enable trustless communication between Verifiable Immutable Data Applications (VIDAs), and also between VIDAs and external systems (e.g. IBC).

1. **VIDA-to-VIDA Communication**: They facilitate secure transaction forwarding between Verifiable Immutable Data Applications (VIDAs) within the PWR Chain, ensuring seamless interoperability without compromising decentralization.
2. **VIDA-to-External System Communication**: They act as trustless bridges, allowing VIDAs to interact with external networks and protocols (e.g., IBC), expanding their reach beyond the PWR Chain.

This dual functionality ensures that VIDAs can communicate with each other and with external ecosystems while maintaining decentralization and security. Below, we explain their role, selection process, and how they secure cross-VIDA and cross-system interactions.

## When Are Conduit Nodes Needed?

**Optional by Design**

- **Not All VIDAs Need Them**: Conduit Nodes are only required if a VIDA needs to send data or requests (transactions) to another VIDA or external system.
- **Example:**
    - A *Payment VIDA* might need Conduit Nodes to notify a *Shipping VIDA* when an order is paid.
    - A DeFi VIDA might need Conduit Node to bridge funds using Cosmos IBC
    - A standalone Voting VIDA with no external dependencies doesn’t need Conduit Nodes.

## How Conduit Nodes Work

### 1. Primary Role: Internal VIDA Communication

- **Transaction Relaying:** Facilitate VIDA-to-VIDA messaging within PWR Chain.
- **Voting Mechanism:** Conduit Nodes vote to approve requests, ensuring only valid transactions are sent.

### 2. Secondary Role: Cross-Chain Support

- **Protocol Flexibility:** For VIDAs needing external interoperability, Conduit Nodes translate requests into formats like **IBC packets**.

### 3. Selection Process

- **VIDA-Specific Rules:**
  Each VIDA defines its own criteria for selecting Conduit Nodes, such as:

  - **Staking Requirements:** Nodes must lock PWR Coin as collateral.
  - **Reputation:** Nodes with a history of reliable service.
  - **Geographic Distribution:** Minimize single points of failure.
  - **Custom Parameters:** Such as requiring the Conduit to stake the project's coin, or undergo KYC.

### 4. Transaction Lifecycle

1. **Request Detection:**
   - Conduit Nodes monitor their VIDA for outgoing requests (e.g., "Notify Shipping VIDA: Payment Complete").

2. **Voting:**
   - Conduit Nodes vote on whether to approve the request.
   - Example: A VIDA might require **2/3 of Conduit Nodes** to agree.

3. **Transaction Creation:**
   - If approved, the Conduit Nodes jointly sign a PWR Chain transaction addressed to the target VIDA.

4. **Validation:**
   - PWR Chain validators verify the Conduit Nodes’ signatures and finalize the transaction.

When using external protocols such as **IBC**, Conduit nodes can be customized to handle requests in a format compatible with the external protocol.

<img src="/img/conduits.webp" />

## Security & Decentralization

### 1. Anti-Collusion Safeguards

- **Staking Slashing:** Conduit Nodes risk losing staked PWR Coin for malicious voting.
- **Transparency:** All votes and transactions are recorded on PWR Chain for audits.

### 2. Customizable Consensus

- **Threshold Flexibility:**  
  VIDAs choose their voting thresholds (e.g., 51% majority, 80% supermajority).

- **Example:**
  - A high-value financial VIDA might require **90%** consensus among Conduit Nodes.
  - A gaming VIDA might use **51%** for faster interactions.

## Example Workflow: Cross-VIDA Payment

1. **Request:** A user pays via a _Payment VIDA_, which needs to notify a _Shipping VIDA_.
2. **Detection:** The Payment VIDA's Conduit Nodes detect the outgoing request.
3. **Voting:** 8/10 Conduit Nodes approve the request.
4. **Transaction:** The approved message is sent to PWR Chain as a transaction tagged with the Shipping VIDA's ID.
5. **Processing:** The Shipping VIDA reads the transaction and initiates delivery.

## Why Use Conduit Nodes?

| Traditional Systems                  | Conduit Nodes                        |
|--------------------------------------|--------------------------------------|
| Rely on centralized APIs.            | Trustless, decentralized relays.    |
| Vulnerable to single points of failure. | Redundant nodes ensure uptime.     |

## Key Takeaways
- **Optional Infrastructure:** Only VIDAs requiring cross-app communication need Conduit Nodes.
- **VIDA Autonomy:** Each VIDA selects and governs its Conduit Nodes based on its own rules.
- **Trustless Design:** PWR Chain enforces transparency, while Conduit Nodes prevent spam and fraud.

For developers building interoperable VIDAs, Conduit Nodes provide a flexible, secure way to bridge applications without sacrificing decentralization.
