---
title: FAQs
sidebar_position: 9
---

# FAQs

## How does PWR Chain Resolve Inconsistent VIDA Execution Results?

Anyone on PWR Chain can run a VIDA to independently verify its results (if the VIDA is public). However, inconsistent results may arise if VIDA instances are running different versions, encountering non-deterministic behavior, or facing unexpected issues.

VIDAs are responsible for implementing their own execution verification mechanisms. This can be achieved through cross-instance state verification or validation by Conduit Nodes, which confirm the results and publish their state root hash on the PWR Chain.

**Best Practices to Prevent Inconsistencies:**

- VIDAs must adhere to deterministic execution rules (e.g., avoiding floating-point operations or local system time).
- External data sources (e.g., APIs) must be validated and timestamped by Conduit Nodes before being used in VIDA logic.

---

## Inconsistent VIDA Results from Non-Deterministic Execution?

Non-deterministic execution is not allowed in a VIDA, randomness and other Non-deterministic practices make it impossible to create a consistent execution result across different VIDA Execution Instances.

If a VIDA wants to use randomness, it should derive randomness from on-chain data (e.g., block hashes or timestamps) to ensure reproducibility. Example:

```python
# Seed RNG with block hash of transaction  
import hashlib  
seed = hashlib.sha256(pwr_chain.get_block_header(tx.block_height)).digest()  
random.seed(seed)  
```

Or it should Use external randomness providers (e.g., Chainlink VRF) only if their outputs are recorded on PWR Chain first1.

Time-based logic can still be implemented because PWR Chain timestamps all transactions and that can be used to create time-based logic.

---

## Are there any restrictions on external API calls within VIDAs?

There are no restrictions on external API calls. However, if an API returns data that can change over time or introduce non-determinism, it should be handled by Conduit Nodes instead of being directly queried by the VIDA. The Conduit Nodes will fetch the data, reach consensus through a voting process, and publish the agreed-upon result on PWR Chain with a timestamp. This ensures that future VIDA Execution Instances can reference the same verified data at a specific point in time, preventing state inconsistencies and maintaining execution integrity.

---

## How are VIDA Upgrades Managed without Breaking Replayability?

A structured approach to upgrades involves assigning a version identifier to the VIDA. 

If the VIDA is centralized, then the development team can announce upgrade schedules, version numbers, and application hashes.

If it's decentralized, Conduit Nodes can vote on upgrade schedules, version numbers, and application hashes. 

Once an upgrade is approved, both Conduit Nodes and VIDA Execution Instances must update their software accordingly. If a node fails to update before the new version becomes active at a specified block or timestamp, it will be unable to continue operating and will effectively freeze.

---

## If an VIDA’s Logic Changes, how does PWR Chain Ensure Past Transactions Remain Verifiable?

VIDA upgrades must either be backward-compatible or preserve the previous logic for processing transactions up to the block where the update was applied.

