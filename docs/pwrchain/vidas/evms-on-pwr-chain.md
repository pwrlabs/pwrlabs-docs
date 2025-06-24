---
title: EVMs on PWR Chain
sidebar_position: 4
---

# EVMs on PWR Chain

Ethereum Virtual Machines (EVMs) operate seamlessly on PWR Chain as **Verifiable Immutable Data Applications (VIDAs)**, combining the familiarity of Ethereum with PWR Chain’s scalable, decentralized infrastructure. EVM VIDAs inherit PWR Chain’s security and decentralization while maintaining full compatibility with Ethereum tooling, wallets, and tokens. Crucially, **end users interact with the EVM as if it were a standalone Layer 1 (L1) chain**—they use the EVM’s native coin (e.g., ETH, USDC) and never need to interact directly with PWR Chain or its native token ($PWR). Below, we detail how EVMs function within the PWR ecosystem and their unique advantages.

## Transaction Lifecycle & Flow

### User Perspective:

To end users, the EVM on PWR Chain feels indistinguishable from a traditional L1:

1. **Initiate Action:** A user sends a transaction (e.g., token swap) via MetaMask or another EVM wallet.
2. **Pay Fees:** Fees are deducted in the EVM’s native coin (e.g., ETH), *not $PWR*.
3. **Instant Finality:** Transactions are finalized in seconds, visible on EVM block explorers.

### Behind the Scenes:

1. **User Action:** A user initiates a transaction (e.g., token swap) via an EVM-compatible wallet (e.g., MetaMask).
2. **Wrapper Node:** The transaction is routed to a **wrapper node**, which acts as an intermediary.
    - Wraps the transaction into a VIDA Data Transaction format.
    - Pays the fee in `$PWR` to include the transaction on the PWR Chain, then receives 50% of the user’s EVM fee as a reward, automatically converting EVM-native fees into $PWR and effectively shielding end users from direct interaction with the PWR Chain.
3. **PWR Base Layer:** The transaction is recorded on PWR Chain with instant finality.
4. **EVM VIDA Processing:** The EVM VIDA reads the transaction, executes the smart contract logic off-chain, and updates its state.
5. **Verification:** Anyone can rerun the EVM VIDA to validate results against PWR Chain’s immutable ledger.

<img src="/img/tx-processing.avif" />

## VIDA Execution Instance Roles: RPC & Wrapper Nodes

EVM VIDA Execution Instances can serve dual roles to enhance usability:

- **RPC Nodes:** Provide endpoints for users to query blockchain data (e.g., balances, contract states).
- **Wrapper Nodes:** Facilitate seamless interaction between EVM wallets and PWR Chain.
    - Enable users to pay fees in **any cryptocurrency** (e.g., ETH, USDC).
    - Automatically convert fees to **$PWR** and reimburse themselves from the EVM or user.

**Why Wrapper Nodes Matter:**

- Eliminate the need for users to hold **$PWR** or interact with the PWR Chain directly.
- Simplify onboarding for Ethereum developers and users and maintain the same user experience.

## **Unique Features of EVMs on PWR Chain**

1. **High Scalability**
- **Average TPS:** 4,000
- **Max TPS:** 10,000

2. **Automated Smart Contracts**
- Contracts can trigger actions autonomously (e.g., recurring payments, liquidity rebalancing) based on predefined conditions (time, events).
- Reduces reliance on centralized keepers or manual interventions.

3. **Fee Sponsorship**
- Projects or third parties can sponsor transaction fees for users.
- Enables gasless interactions (e.g., free NFT mints, subsidized DeFi trades).

## FAQ

**Why do wrappers receive only 50% of the EVM fee?** <br/>
Wrappers receive only 50% of the EVM Fee in order to protect the EVM from attacks. If the wrapper received 100% of the EVM Fee, then they can spam the EVM with high gas transactions for no cost.

**Who receives the other 50%?** <br/>
This is customizable. It can be sent to a foundation address, charity, or burned.  
