---
title: Automation Feature on PWR Chain EVMs
sidebar_position: 3
---

# Automation Feature on PWR Chain EVMs

Automation on PWR Chain EVMs provides a powerful mechanism to execute specific functions in smart contracts at predetermined intervals or based on predefined rules. This is achieved using the `AutomationManager` contract, which allows developers to automate repetitive tasks efficiently. By leveraging this feature, developers can enhance the functionality of their decentralized applications (dApps) and streamline operations.

In this guide, we’ll walk through the `AutomationManager` contract and demonstrate its usage with a real-world example.

## Key Concepts

1. **AutomatableContract Interface**: Defines the functions that a contract must implement to be automatable:
    - **owner**: Returns the owner of the contract.
    - **shouldBeExecuted**: Determines whether the automated action should run based on rules.
    - **executeAutomaticAction**: Executes the automated task.

2. **AutomationManager Contract**: Manages automation subscriptions and executes actions for subscribed contracts.

## AutomationManager Contract Overview

The `AutomationManager` contract is deployed at: **`0x5083683DafDCAAaAC519113691b80a3F05115782`**

**Key Features**

1. Subscription Management:
    - Contracts can subscribe to automation by paying a small fee.
    - Subscriptions can be canceled, and unused funds refunded.

2. Funding Automation:
    - Contracts must maintain a balance to cover execution costs.

3. Execution Logic:
    - Executes the executeAutomaticAction function of subscribed contracts.

4. Inactivity Handling:
    - Contracts inactive beyond a threshold are automatically unsubscribed.


## Example: Automated Reward Distribution

### Scenario

A decentralized e-commerce platform wants to reward loyal customers with points automatically every 5 minutes. Each merchant on the platform can subscribe their contract to automate the distribution of loyalty points.

### Smart Contract: LoyaltyRewards

Here’s a sample smart contract to implement the loyalty points system:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface AutomatableContract {
    function owner() external view returns (address);
    function shouldBeExecuted(uint256 blockNumber, uint256 timestamp) external view returns (bool);
    function executeAutomaticAction() external;
}

contract LoyaltyRewards is AutomatableContract {
    address public _owner;
    uint256 public lastExecuted;
    mapping(address => uint256) public loyaltyPoints;

    constructor() {
        _owner = msg.sender;
    }

    function owner() external view override returns (address) {
        return _owner;
    }

    function shouldBeExecuted(uint256 blockNumber, uint256 timestamp) external view override returns (bool) {
        // Execute once every 5 minutes
        return (timestamp - lastExecuted) >= 5 minutes;
    }

    function executeAutomaticAction() external override {
        // Reward loyalty points to customers
        address[] memory customers = getEligibleCustomers();
        for (uint256 i = 0; i < customers.length; i++) {
            loyaltyPoints[customers[i]] += 2; // Reward 2 points
        }
        lastExecuted = block.timestamp;
    }

    function getEligibleCustomers() internal pure returns (address[] memory) {
        // Dummy implementation for eligible customers
        address[] memory customers = new address[](2);
        customers[0] = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        customers[1] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        return customers;
    }
}
```

### Steps to Automate with AutomationManager

1. Deploy the Automatable Contract

    - Deploy the **LoyaltyRewards** contract on the PWR Chain EVMs.
    - Note the contract address.

2. Fund the Contract

    - Use the `fundContract` function on the `AutomationManager` contract to add funds to the automation system.
    ```bash
    cast send --rpc-url <RPC_URL> --private-key <YOUR_PRIVATE_KEY> 0x5083683DafDCAAaAC519113691b80a3F05115782 "fundContract(address)" <LOYALTY_CONTRACT_ADDRESS> --value 1ether
    ```

3. Subscribe the Contract

    - Call the `subscribe` function to enable automation for the contract.
    ```bash
    cast send --rpc-url <RPC_URL> --private-key <YOUR_PRIVATE_KEY> 0x5083683DafDCAAaAC519113691b80a3F05115782 "subscribe(address)" <LOYALTY_CONTRACT_ADDRESS> --value 1wei
    ```

4. Monitor Execution

    - The `AutomationManager` contract will now execute the executeAutomaticAction function in the `LoyaltyRewards` contract based on its rules.
    - Check the `lastExecuted` variable in the `LoyaltyRewards` contract to verify execution.
    
## Best Practices

1. **Optimize Gas Usage**: Ensure the automated function is efficient and adheres to the gas limit set by the AutomationManager contract.
2. **Maintain Funds**: Keep the contract adequately funded to avoid being kicked from the subscription.
3. **Test Thoroughly**: Use a testnet to simulate and debug automation behavior before deploying to the mainnet.
4. **Secure Ownership**: Restrict access to sensitive functions using ownership checks.

## Troubleshooting

1. Execution Fails:
    - Check if the contract has enough funds to cover the execution fee.
    - Ensure the shouldBeExecuted function returns true at the correct times.

2. Kicked from Subscription:
    - Verify that the contract’s balance is sufficient and hasn’t fallen below the required threshold.

3. Unexpected Behavior:
    - Debug the executeAutomaticAction function to ensure it behaves as intended during execution.

## Conclusion

Automation on the PWR Chain EVMs provides a seamless way to execute recurring tasks in smart contracts. Whether it’s distributing rewards, managing subscriptions, or other periodic actions, the AutomationManager contract simplifies the process while ensuring reliability and security. By following this guide, you can start automating your dApps effectively.

If you have any doubts or questions, join the [Discord Server](https://discord.com/invite/YASmBk9EME) and we'll be waiting for you there!
