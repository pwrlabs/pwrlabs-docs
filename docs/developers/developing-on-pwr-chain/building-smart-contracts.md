---
title: Building Smart Contracts
sidebar_position: 3
---

# Building Smart Contracts

PWR Chain provides a versatile and flexible environment for building smart contracts, with support for multiple virtual machines (VMs) and programming languages. The process of building smart contracts on PWR Chain may vary depending on the specific VM being used.

## Ethereum-Compatible Smart Contracts

PWR Chain currently hosts two Ethereum-compatible side chains: Ethereum Plus (ETH+) and Bitcoin Plus (BTC+). These side chains are fully compatible with the Ethereum Virtual Machine (EVM) and support smart contract development using Solidity, the most popular language for writing Ethereum smart contracts.

### Solidity Support

Both ETH+ and BTC+ support Solidity smart contracts up to version 0.8.19.

Developers can use familiar Ethereum development tools, such as Truffle, Remix, or Hardhat, to write, test, and deploy smart contracts on these side chains.

### ETH+ RPC Information

- Currency Symbol: **ETH**
- Chain ID: **10023**
- RPC Node URL: **[https://ethereumplus.pwrlabs.io](https://ethereumplus.pwrlabs.io/)**
- Block Explorer URL: **[https://ethplusexplorer.pwrlabs.io](https://ethplusexplorer.pwrlabs.io/)**
- Faucet URL: **[https://faucet.pwrlabs.io/eth-plus](https://faucet.pwrlabs.io/eth-plus)**

### BTC+ RPC Information

- Currency Symbol: **BTC**
- Chain ID: **21000001**
- RPC Node URL: **[https://bitcoinplus.pwrlabs.io](https://bitcoinplus.pwrlabs.io/)**
- Block Explorer URL: **[https://btcplusexplorer.pwrlabs.io](https://btcplusexplorer.pwrlabs.io/)**
- Faucet URL: **[https://faucet.pwrlabs.io/btc-plus](https://faucet.pwrlabs.io/btc-plus)**

## Building Smart Contracts on ETH+ and BTC+

1. Set up a development environment with Solidity and the necessary tools (e.g., Truffle, Remix, or Hardhat).
2. Write your smart contract using Solidity, adhering to the supported version (up to 0.8.19).
3. Test your smart contract locally using the development tools and ensure it functions as intended.
4. Configure your development environment to connect to the desired side chain (ETH+ or BTC+) using the provided RPC Node URL and Chain ID.
5. Deploy your smart contract to the selected side chain using the appropriate deployment tools or scripts.
6. Interact with your deployed smart contract using web3.js, ethers.js, or other compatible libraries.

## Other Virtual Machines

PWR Chain's architecture allows for the integration of various virtual machines, each with its own smart contract programming languages and development environments. As new virtual machines are added to the PWR Chain ecosystem, developers will have the opportunity to build smart contracts using the languages and tools specific to those VMs.

When building smart contracts on other virtual machines, developers should refer to the documentation and guidelines provided by the respective VM's community and ecosystem.

## Best Practices

Regardless of the virtual machine being used, developers should follow best practices when building smart contracts on PWR Chain:

1. Write secure and audited code to prevent vulnerabilities and exploits.
2. Use established libraries and frameworks to minimize the risk of errors and ensure compatibility.
3. Thoroughly test smart contracts before deployment, including edge cases and potential failure scenarios.
4. Implement proper access controls and permissions to restrict unauthorized access to sensitive functions.
5. Stay updated with the latest security patches, upgrades, and best practices specific to the VM and programming language being used.

## Conclusion

PWR Chain provides a flexible and inclusive environment for building smart contracts, with support for Ethereum-compatible side chains (ETH+ and BTC+) and the potential for integrating various other virtual machines. Developers can leverage the familiar tools, languages, and ecosystems of these VMs to create powerful and innovative smart contracts on PWR Chain.

As the PWR Chain ecosystem continues to grow and evolve, developers can expect new virtual machines, programming languages, and development tools to be introduced, expanding the possibilities for smart contract development on this cutting-edge blockchain platform.
