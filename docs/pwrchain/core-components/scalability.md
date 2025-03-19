---
title: Scalability
sidebar_position: 3
---

# Scalability

Traditional blockchain architectures face two primary bottlenecks that limit scalability:

1. **Smart Contract Virtual Machines (VMs)**: Complex on-chain execution environments like Ethereum’s EVM impose computational overhead, restricting throughput.
2. **Transaction Signature Verification**: Cryptographic signature checks, especially under high load, consume significant time and resources.

PWR Chain eliminates the first bottleneck entirely by **decoupling execution from consensus**. Unlike monolithic chains, PWR Chain does not process smart contracts or host a VM on itself. Instead, Verifiable Immutable Data Applications (VIDAs) handle logic off-chain, freeing the blockchain to focus solely on ordering and securing transactions.

The remaining challenge—signature verification—is addressed through two innovations:

## Post-Quantum Signature Efficiency

PWR Chain uses **Falcon**, a post-quantum secure signature scheme optimized for speed.  
A single CPU core can verify **20,000–40,000 Falcon signatures per second** (depending on hardware),  
making it orders of magnitude faster than classical algorithms like **ECDSA**.

## Parallelized Processing

PWR Chain is a **multi-threaded blockchain**, enabling validators to verify signatures and process  
transactions in parallel across multiple CPU cores. This design ensures linear scalability:

- **1 core:** 20k–40k transactions per second (**TPS**).
- **16-core server (32 threads):** Over **600k TPS** (e.g., 32 threads × 20k TPS).

Validators can dynamically scale server capacity to meet demand. For example:

- **Low-cost deployment:** A **$6/month** server (4 cores/8 threads) handles **160k TPS**.
- **Enterprise-grade throughput:** A **$140/month** server (16 cores/32 threads) achieves **600k+ TPS**.

## Cost Efficiency

By avoiding smart contract execution and leveraging lightweight cryptography, PWR Chain reduces operational costs to a fraction of traditional chains. Validators incur minimal expenses while supporting global-scale throughput, making PWR Chain:

- **Accessible:** Start with consumer-grade hardware.
- **Future-proof:** Scale seamlessly via horizontal server upgrades.

## Comparison to Traditional Chains

| Metric               | Ethereum       | Solana        | PWR Chain             |
|----------------------|---------------|--------------|------------------------|
| **On-chain execution**  | Yes (EVM)     | Yes (Sealevel) | **No** (VIDAs off-chain) |
| **Signature Scheme**    | ECDSA         | Ed25519      | **Falcon**             |
| **Max TPS**            | ~30           | ~65k        | **600k+**              |

This architecture ensures PWR Chain scales not just through VIDA parallelism but also via blockchain optimizations, making it one of the most efficient and cost-effective blockchains for high-throughput use cases.
