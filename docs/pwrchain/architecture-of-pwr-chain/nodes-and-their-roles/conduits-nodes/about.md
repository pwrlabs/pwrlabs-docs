---
title: About
sidebar_position: 1
---

# About Conduits Nodes

## How Conduit Nodes Came to Be?

PWR Chain aims at enabling seamless interaction between the different software application and virtual machines built on it. To enable that, PWR Chain gives these applications to send transactions to the base layer, and through it send transactions to each other. 

Decentralized virtual machines and software applications can't hold wallets or private keys of their own due to their decentralized nature (They can be stolen). To enable these applications to send transactions, PWR Chain introduced conduit nodes.

## What are Conduit Nodes?

In PWR Chain, conduit nodes play a crucial role in fostering interoperability and ensuring seamless interactions between various virtual machines (VMs), software applications, and the blockchain’s base layer. Functioning as both lite validators and transaction relay nodes, conduit nodes execute and manage VMs and applications that rely on them, effectively translating their activities into transactions on the PWR Chain.

Conduit nodes operate these VMs and applications in a fully decentralized manner. They are responsible for processing and verifying each action, ensuring that all requests from applications are valid and correctly executed on the blockchain. This setup not only enhances the security and efficiency of the network but also maintains the decentralized ethos of blockchain technology by preventing any single point of control or failure.

## How Conduit Nodes Work?
Let's say we have a decentralized software application A that allows escrow contracts and recurring payments on PWR Chain. And we have software application B which provides a stable coin.

An employer wants to use application A to automatically pay his employee's every month, but he wants to pay them with application B's stable coin. Application A should be able to send transactions to application B to tell it to transfer coins to the employees.

Application A's developer agrees with some validators on PWR Chain to serve as the conduit nodes of his application. Once he sets them as conduit nodes, these validators would run application A, and at the end of every month application A would emit a request to the conduits to send a transaction to applciation B.

The conduit nodes of application A send transactions to the [base layer](/pwrchain/architecture-of-pwr-chain/base-layer) informing it that application A wants to send transcation X and they vote on it. Once the base layer receives approval votes from 2/3 of the conduits it accepts transaction X and puts it on the blockchain.

This transaction is unique from other transactions because it doesn't have a signature but is rather assigned an owner address (address of application A) and is backed by the votes of its conduits.

Application B then receives this transaction and processes it.
