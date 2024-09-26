---
title: Virtual Machines
sidebar_position: 1
---

# Virtual Machines

PWR Chain's unique architecture allows numerous virtual machines (VMs) such as an Ethereum Virtual Machine, Solana Virtual Machine, Move Virtual Machines, and others to exist on top of it. Unlike conventional smart contract blockchains, PWR Chain runs virtual machines on top of the blockchain with a separate state to ensure that validator node's operations are not affected by smart contracts built on the blockchain. This separation allows PWR Chain to support any and all virtual machines and allow them to run in parallel without affecting the PWR Blockchain or each other.  

## How does it work?

Virtual machines on PWR chain exist as processing units, they are not L2's. Meaning that these virtual machines do not need to worry about any of the blockchain operations such as consensus, security, blocks, or transactions, and they only focus on processing incoming transactions. When users want to interact with these virtual machines, they submit their transactions directly to the PWR Chain Base Layer, once this transaction is put in a block, it is captured by the virtual machines and processed.

To remove unnecessary processing load from virtual machines, users specify to which VM their transaction is meant, allowing for fast and efficient capturing and sorting of transactions.

## State Verification

There is a big misconception across the web3 community that validator nodes validate the state of the blockchain and the VMs. In reality, validator nodes are primarily responsible for validating and agreeing on new blocks to be added to the blockchain. They participate in the consensus mechanism to ensure that the blocks being added to the chain are valid and follow the network's rules.

However, the validation of the state is typically done by each individual node operator, including validator nodes, RPC nodes, and lite nodes.

There are two components needed to construct and validate the state of a VM:

- The rules of the VM
- The blocks and the transactions they hold

PWR Chain provides these blocks and transactions to any and all VMs, and each VM's rules and code are public. This allows anyone to reconstruct and validate the state of these VMs by simply running them, fetching the transactions from PWR Chain, and processing them.

## Scalability 

PWR Chain's unique architecture, which separates the blockchain operations from the virtual machines (VMs), allows for exceptional scalability. By offloading the smart contract execution to the VMs, the base layer of PWR Chain can focus on its core functions, such as consensus, security, and transaction processing. This separation enables the VMs to scale independently without impacting the performance of the base layer.

Since the VMs do not need to concern themselves with blockchain operations and can dedicate their resources to processing smart contracts, they can achieve significant scalability. If implemented correctly, the VMs can scale to match the throughput of the base layer, which is capable of handling up to 300,000 transactions per second (TPS).

The parallel execution of multiple VMs further enhances the scalability of the PWR Chain. Each VM can process transactions simultaneously, allowing for a high degree of concurrency and efficient utilization of resources. This parallel processing capability enables PWR Chain to support a vast number of dApps and users without compromising performance.

## User Experience

PWR Chain prioritizes user experience by ensuring that interactions with virtual machines (VMs) are seamless and familiar. Thanks to wrapper nodes, users can enjoy the same user experience on PWR Chain as they would on any other blockchain platform.

Wrapper nodes act as a link between the users and the VMs, abstracting away the complexities of the underlying architecture. They provide a compatible interface for users to interact with the VMs, similar to how they would interact with smart contracts on other blockchains. This means that users can use existing tools, wallets, and dApp interfaces they are already familiar with, without the need to learn new systems or adapt to different workflows.

For example, if a user wants to interact with an Ethereum Virtual Machine (EVM) on PWR Chain, they can use popular Ethereum wallets like MetaMask or TrustWallet. The wrapper node translates the user's actions into the appropriate format required by the PWR Chain base layer and routes the transactions to the designated VM. From the user's perspective, the experience is identical to interacting with an EVM on the Ethereum network.

Similarly, for other VMs like the Solana Virtual Machine or Move Virtual Machines, wrapper nodes ensure that the user experience remains consistent with their native platforms. Users can leverage the tools and interfaces they are accustomed to, such as Solana wallets or Move-compatible dApps, to interact with the respective VMs on PWR Chain.

This approach not only enhances user adoption by providing a familiar and user-friendly experience but also enables developers to port their existing dApps and smart contracts to PWR Chain with minimal modifications. Developers can focus on building innovative applications without worrying about the intricacies of the underlying blockchain infrastructure.

Moreover, the separation of VMs from the base layer allows for independent upgrades and optimizations to the user experience. Each VM can evolve and improve its user interface and tools without affecting the stability or performance of the PWR Chain base layer, or requiring its permission. This flexibility enables PWR Chain to continuously enhance the user experience across different VMs, keeping pace with the latest advancements and user expectations.