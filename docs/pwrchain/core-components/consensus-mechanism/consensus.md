---
title: Consensus
sidebar_position: 1
---

# Consensus

PWR Chain builds upon the Tendermint consensus protocol while introducing specific enhancements for quantum security and faster block creation. Compared to standard Tendermint, the key differences are:

- **Post-Quantum Signatures**:
PWR Chain replaces classical signature algorithms (e.g., Ed25519) with Falcon, a post-quantum secure scheme. This strengthens the chain’s resistance against potential quantum-computing attacks.

- **UDP-Based Gossip**:
Instead of using TCP for consensus messages, PWR Chain leverages UDP to broadcast and gossip validator votes and signatures. This aims to reduce overhead, decrease latency, and speed up block finalization.

- **Equal Chances**:
Instead of giving validators chances proportional to their stake, all active validators on PWR Chain have equal chances to submit blocks.  

For additional details on the foundational protocol, refer to the [Tendermint paper](https://tendermint.com/static/docs/tendermint.pdf).

## Why is Equal Chances Important for Decentralization?

In conventional Proof-of-Stake (PoS) systems, validators receive block creation opportunities in proportion to their stake. Many blockchains have adopted this approach, and we’ve seen it often lead to centralization. Why does this happen?

When block creation chances are tied to stake size, large validators naturally produce most of the blocks. This results in a stable return on investment (ROI) for their delegators, which in turn attracts even more delegators. As a result, these large validators grow larger and more influential over time.

On the other hand, if all validators receive an equal opportunity to create blocks, they each earn roughly the same total reward. However, a validator with a large stake must distribute that reward across a bigger pool of delegators, lowering its ROI compared to smaller validators. This dynamic incentivizes users to delegate to smaller validators, which helps maintain a more decentralized network.

## The Math in an Equal Chances Model

1. **Validators and Stakes**
   - **V1** has a stake of **1,000,000** coins.
   - **V2** has a stake of **500,000** coins.

2. **Equal Yearly Reward**
    - Both V1 and V2 receive the same total yearly reward, **R**.
        - V1 earns **R** per year (across its **1,000,000** staked coins).
        - V2 earns **R** per year (across its **500,000** staked coins).

3. **Yearly Yield per Coin**
    - For V1: yield per coin = **R / 1,000,000**
    - For V2: yield per coin = **R / 500,000**
    
    **Observing the numbers:**
        - **R / 500,000** is equal to **2 × (R / 1,000,000)**.
        - Therefore, each coin staked with V2 earns **twice as much** as each coin staked with V1, because V2 has half the stake of V1 but still gets the same block reward **R**.

4. **Why This Encourages Decentralization**
    - Large validators (with large stake) have a **lower yield per coin** than smaller validators.
    - Delegators seeking higher returns are incentivized to stake with **smaller validators**, which helps distribute stake more evenly over time and **fosters decentralization**.
