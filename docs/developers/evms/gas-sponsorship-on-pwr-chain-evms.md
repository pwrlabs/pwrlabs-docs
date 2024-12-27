---
title: Gas Sponsorship Feature on PWR Chain EVMs
sidebar_position: 2
---

Gas sponsorship is a unique and practical feature available on the PWR Chain EVMs. It allows users to sponsor gas fees for other accounts, making transactions easier for sponsees. This guide explains how the `GasSponsorshipManager` contract works and provides a step-by-step approach to interact with it. By the end of this guide, you'll understand how to sponsor transactions, remove sponsorships, and query sponsorship information.

## What is Gas Sponsorship?

Imagine you're helping a friend by covering their transaction fees on the blockchain. That’s exactly what gas sponsorship does. Sponsors can link their account to a sponsee, and the protocol takes care of the fee payments based on the relationships stored in the `GasSponsorshipManager` contract.

This contract doesn’t process payments directly but acts as a database of sponsorships. The protocol orchestrator reads these relationships and handles the gas payments accordingly.

## Understanding the GasSponsorshipManager Contract

The `GasSponsorshipManager` contract lets sponsors and sponsees interact in three main ways:

1. **Add Sponsorship**: Link a sponsor to a sponsee.
2. **Remove Sponsorship**: Unlink a sponsor from a sponsee.
3. **Query Sponsorship**: Check if a sponsee has a sponsor.

**Contract Address**: `0xeed9494e44d945491616B1B0F53B9c656674B352`

## How to Interact with the Contract

### 1. Prerequisites

1. **Contract Address**: Use the deployed contract address: `0xeed9494e44d945491616B1B0F53B9c656674B352`
2. **Wallet and RPC Details**: Ensure you have a funded wallet and the RPC URL for the PWR Chain EVMs network.
3. **A Tool for Interaction**: You can use tools like Foundry’s cast, Remix, or a custom script.

### 2. Adding a Sponsorship

This function allows you to sponsor someone’s transactions.

**How it Works:**

- You call the addSponsorship function and specify the sponsee's address.
- The contract checks if the sponsee already has a sponsor.
- If not, the sponsorship is added, and an event is emitted.

**Example Command:**

```bash
cast send --rpc-url <RPC_URL> --private-key <YOUR_PRIVATE_KEY> 0xeed9494e44d945491616B1B0F53B9c656674B352 "addSponsorship(address)" <SPONSEE_ADDRESS>
```

**What to Expect:**

- Success: A new sponsorship is created.
- Failure: If the sponsee already has a sponsor, you’ll see an **AlreadySponsored** error.

### 3. Removing a Sponsorship

This function allows you to stop sponsoring someone.

**How it Works:**

- Call the removeSponsorship function with the sponsee's address.
- The contract checks if you’re the sponsor for that sponsee.
- If so, the sponsorship is removed, and an event is emitted.

**Example Command:**

```bash
cast send --rpc-url <RPC_URL> --private-key <YOUR_PRIVATE_KEY> 0xeed9494e44d945491616B1B0F53B9c656674B352 "removeSponsorship(address)" <SPONSEE_ADDRESS>
```

**What to Expect:**

- Success: The sponsorship is removed.
- Failure: If you’re not the sponsor, you’ll see a NotSponsored error.

### 4. Querying a Sponsor

Need to check who’s sponsoring an account? Use this function to get the sponsor’s address.

**Example Command:**

```bash
cast call --rpc-url <RPC_URL> 0xeed9494e44d945491616B1B0F53B9c656674B352 "getSponsor(address)(address)" <SPONSEE_ADDRESS>
```

**What to Expect:**

- If the sponsee has a sponsor, the sponsor’s address will be returned.
- If not, you’ll see 0x0000000000000000000000000000000000000000.

### 5. Checking Transaction Sponsorship

You can also check if a specific transaction sender is sponsored.

**Example Command**:

```bash
cast call --rpc-url <RPC_URL> 0xeed9494e44d945491616B1B0F53B9c656674B352 "isTransactionSponsored(address)(bool)" <SENDER_ADDRESS>
```

**What to Expect:**

- `true`: The sender has a sponsor.
- `false`: The sender does not have a sponsor.

## Use Case: Helping a Friend

Let’s say Alice wants to sponsor Bob’s transactions on the PWR Chain EVMs. Here’s what she’ll do:

1. Call the addSponsorship function with Bob’s address.
2. Once the transaction is confirmed, the protocol will recognize Bob as sponsored by Alice.
3. Bob can now perform transactions with Alice covering the gas fees.
3. If Alice wants to stop sponsoring Bob, she’ll call the removeSponsorship function.

## Best Practices

1. **Double-Check Addresses**: Always verify the sponsee address before adding a sponsorship.
2. **Secure Your Private Key**: Ensure your private key is safely stored.
3. **Test First**: If you’re unsure, test interactions on a testnet.
4. **Monitor Sponsorships**: Regularly review your sponsorships to avoid misuse.

## Conclusion

Gas sponsorship on the PWR Chain EVMs is a powerful tool for enabling seamless transactions. By sponsoring others, you can help reduce barriers and improve their experience on the blockchain. With this guide, you’re ready to start using the `GasSponsorshipManager` contract effectively.

If you have any doubts or questions, join the [Discord Server](https://discord.com/invite/YASmBk9EME) and we'll be waiting for you there!
