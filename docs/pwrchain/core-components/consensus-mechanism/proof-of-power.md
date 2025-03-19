---
title: Delegated Proof of Power
sidebar_position: 2
---

# Delegated Proof of Power

Consensus is the method of choosing which validator on the network will propose the next block.

PWR Chain's consensus algorithm is known as Delegated Proof of Power (DPOP).

## Benefits

- **Instant finality**: Once block is added to the blockchain it can never be changed, removed, or replaced.
- **High security**: DPOP ensures that every block that enters the network is valid and approved by 2/3 of the network.
- **Fairness & decentralization**: DPOP ensures fairness among validators and is the first consensus algorithm to incentivize decentralization. 
- **Cost effective & green**: DPOP is a very lite algorithm and operates with minimal processing power usage.

## How it Works ?

### Selection of Validators

Anyone can run a validator node on PWR Chain but only the 200 validators with the most staking power are chosen as active validators to run the network. Network participants (token holders) delegate their voting power to validator nodes they trust to act in the network's best interest. This delegation is not merely based on the wealth or stake of the validators but also considers their reputation and past performance. This process democratically distributes power among validators, reducing the risk of centralization.

### Proposition of Blocks

Once validators are chosen, they take turns proposing new blocks to the network based on a set round robin style schedule that ensures every validator gets a fair chance to participate. This prevents any single validator from dominating the block creation process. Unlike other proof of stake blockchains where the likelihood of proposing a block is proportional to the amount of stake or wealth a node controls, PWR Chain gives all the active nodes equal chances to submit blocks, ensuring a democratic and decentralized process. 

> Note: If a validator is offline or unreachable, other validators can chose to skip them and accept blocks from the next validator.

### Blocks Validation

When a validator proposes a new block to PWR Chain, it is first distributed to all other active validators through a gossip protocol. The other validators check the block and make sure that the block and all the transactions it is holding are valid and adhering by the rules of PWR Chain. If it checks out, then they sign the block using their private key and share this signature with other validators through the gossip protocol.

A block needs 2/3 of the staking power on the network approving it to be accepted into the network.

`Block approval staking power = Proposer's staking power + Sum of signers' staking power`

Once a block has 2/3 staking power approval it is added to the blockchain.

<img src="/img/blocks-validation.png" />

### Block Reward Distribution

The block reward on PWR Chain is the sum of fees of transactions that were included in the block.

`Block reward = sum(transaction fees)`

Adding blocks to the PWR Chain requires a collective effort from all validator nodes. As such PWR Chain distributes the reward of a block across all active validators in the following form:
- 50% of block reward goes to block proposer (The validator that proposed the block).
- 50% is distributed equally across all other active validators.

This distribution mechanism ensures fair compensation for all network participants, and further decentralizes the network by distributing the wealth.

## How DPOP Incentivizes Decentralization?

DPOP ensures that all active validators have equal chances to submit blocks, ensuring fair participation and not giving any validator advantage over the others.

DPOP also ensures that voting power is distributed equally among validators through natural economic incentives. How does it do that?

As explained in the documentation above, all active validators have equal chances to submit blocks, and block rewards are split across all validators. Due to these factors almost all active validators will end up submitting the same amount of blocks and making approximately the same amount of rewards.

Validators keep 1% of the rewards they make (operations fee) and distribute the other 99% to their delegators.

Validators with a lot of staking power have to distribute the reward on a big pool of delegated coins. While the validators with little voting power have to distribute approximately the same reward on a smaller pool. Thus, the delegators of the smaller validator will make more because the reward isn't split to as many shares as it is with the validator holding a lot of voting power.

Let's put it in a formula:

```
Validator 1 staking power (v1sp) = x
Validator 2 staking power (v2sp) = 5x

Reward = y

Validator 1 reward per x (v1rpx) = x * (y / v1sp) = y
Validator 2 reward per x (v2rpx) = c * (y / v2sp) = y/5
```

The above example shows how Validator 2, that has 5 times more staking power than Validator 1 makes its users 5 times less rewards compared to validator 1.

These results incentivize users to delegate to smaller nodes to make rewards. This natural economic incentive leads to a more even distribution of staking power among validators, as users are encouraged to delegate their tokens to smaller validators to maximize their rewards. As a result, the network becomes more decentralized, with staking power spread across a larger number of independent validators. Eventually this creates a network with equal distribution of voting power across all participants.

Moreover, the reputation-based delegation mechanism in DPOP allows users to consider factors beyond just the size of a validator's staking power when deciding where to delegate their tokens. By taking into account a validator's past performance and reputation, users can make informed decisions that prioritize the overall health and security of the network.

In conclusion, DPOP's unique features, including equal block proposition chances, fair reward distribution, and the economic incentives that encourage delegation to smaller validators, work together to create a highly decentralized and secure blockchain network. By aligning the interests of validators and delegators and promoting a more even distribution of power, DPOP sets itself apart from other consensus algorithms and provides a strong foundation for the PWR Chain ecosystem.
