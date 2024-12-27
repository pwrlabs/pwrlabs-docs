---
title: Deploying a Smart Contract using Foundry
sidebar_position: 1
---

# Deploying a Smart Contract using Foundry

This guide covers how to deploy a simple smart contract on your EVM, built on top of PWR Chain, using the Foundry framework. By following these steps, you will set up your environment, write, and deploy a basic Solidity contract.

## Prerequisites

Before you begin, ensure you have the following installed and configured:

1. Foundry: A blazing-fast, modular, and portable Ethereum development framework.

    - Install Foundry by running:
    ```bash
    curl -L https://foundry.paradigm.xyz | bash foundryup
    ```

2. Wallet/Private Key:

    - Have an account with funds on your EVM network.
    - Keep the private key of the account handy for deployment.

3. Basic Knowledge of Solidity:

    - Familiarity with Solidity and smart contracts is recommended.

## Setup

To build the smart contracts we will be using Foundry. first create a new folder on your computer - we will name ours `foundry-app` and go to it through your Terminal.

```bash
forge init foundry-app
```

## Writing the Simple Contract

Once your Foundry project is set up, open the `foundry-app` folder in your code editor, and create a new file named `SimpleContract.sol` inside `src`. Write the following code in that file:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleContract {
    string public message;

    constructor(string memory _message) {
        message = _message;
    }

    function setMessage(string memory _newMessage) public {
        message = _newMessage;
    }
}
```

## Environment Variables

Start off by going to the `.env` file inside the foundry-app folder and add the following placeholder lines:

```
PRIVATE_KEY="..."
RPC_URL="..."
```

For the `PRIVATE_KEY` variable, export it from MetaMask. Again, make sure to use an account that only has testnet funds in it, no mainnet funds, to not risk accidentally leaking a private key with real money in it. Replace the value of `PRIVATE_KEY` in the `.env` file with the key you export.

For the `RPC_URL`, you can use one of our EVMs like `https://bitcoinplus.pwrlabs.io/`.

## Deploying the Simple Contract

Now we'll have to load our environment variables into the terminal's environment. For doing this, run the following command in your terminal

```bash
source .env
```

Finally, to deploy your contract, run the following command:

```bash
forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY src/SimpleContract.sol:SimpleContract
```

## Verifying the Smart Contract

Verification ensures your deployed contract’s source code matches the on-chain bytecode. You can use the following command to verify your contract directly through Blockscout:

```bash
forge verify-contract \
  --rpc-url $RPC_URL \
  --verifier blockscout \
  --verifier-url 'https://btcplusexplorer.pwrlabs.io/api/' \
  CONTRACT_ADDRESS \
  src/SimpleContract.sol:SimpleContract
```

> Replace `CONTRACT_ADDRESS` with the address of your deployed contract.

## Troubleshooting

- **RPC Connection Issues**: Ensure your RPC URL `https://bitcoinplus.pwrlabs.io/` is reachable.
- **Insufficient Gas**: Make sure your account has enough funds for deployment.
- **Environment Variable Errors**: Double-check your .env file for correct values.
- **Verification Errors**: Ensure you input the correct contract details and URL during verification.

## Conclusion

You have successfully deployed and verified a simple smart contract on your EVM using Foundry. This process can be adapted for more complex contracts and verification workflows.

If you have any doubts or questions, join the [Discord Server](https://discord.com/invite/YASmBk9EME) and we'll be waiting for you there!
