---
title: Building Virtual Machines
sidebar_position: 2
---

# Building Virtual Machines

PWR Chain's unique architecture allows for the creation and deployment of virtual machines (VMs) that operate independently on top of the base layer. Building a VM on PWR Chain typically involves three key components: the virtual machine itself, the handler node, and the wrapper node. These components work together to enable seamless interaction between the VM and the PWR Chain, while providing compatibility with existing wallets and tools.

## Virtual Machine

- The virtual machine is the core component that executes the logic and processes transactions specific to the VM's functionality.
- The VM operates independently from the PWR Chain base layer, ensuring that its operations do not impact the performance or security of the underlying blockchain.

## Handler Node

- The handler node acts as an intermediary between the PWR Chain and the virtual machine.
- It is responsible for reading transactions from the PWR Chain, filtering them based on predefined criteria, and sorting them before passing them to the VM.
- The handler node enforces the rules of transaction entry into the VM, ensuring that only allowed transactions are processed and preventing any malicious transactions from entering the VM.
- It plays a crucial role in maintaining the integrity and security of the VM by applying the necessary validation and filtering mechanisms.
- Handler node might also hold the API calls used to interact with the VM.

## Wrapper Node

- The wrapper node is designed to provide compatibility between the VM and existing wallets that support similar VMs.
- It facilitates the integration of popular wallets, such as MetaMask for an Ethereum-compatible VM on PWR Chain, allowing users to interact with the VM using their familiar wallet interfaces.
- The wrapper node translates and adapts the transactions and interactions from the supported wallets to the format required by the VM on PWR Chain.
- It enables a seamless user experience by abstracting away the complexities of interacting directly with the VM and the PWR Chain.

## RPC Node Integration

- The virtual machine, handler node, and wrapper node are typically integrated as part of the RPC (Remote Procedure Call) node of the VM.
- The RPC node serves as the entry point for users and external systems to interact with the VM, providing the necessary APIs and interfaces for transaction submission, data retrieval, and other VM-specific functionalities.
- By bundling these components together within the RPC node, developers can create a cohesive and efficient system for running and interacting with the VM on PWR Chain.

## User Interaction

- Users can interact with the VM on PWR Chain using various methods, depending on their preferences and the VM's compatibility.
- If the VM has been modified to accept PWR transactions directly, users can utilize the [PWR wallet](https://chromewebstore.google.com/detail/pwr-wallet/kennjipeijpeengjlogfdjkiiadhbmjl) to send transactions and interact with the VM seamlessly.
- For VMs that are built using existing tech stacks and tools, which may support specific transaction formats, users can leverage the wrapper node's compatibility features to interact with the VM using their preferred wallets, such as MetaMask or other supported wallets.
- The wrapper node handles the necessary translations and adaptations, allowing users to experience a familiar and user-friendly interface while interacting with the VM on PWR Chain.

## Conclusion

Building virtual machines on PWR Chain involves the integration of the virtual machine, handler node, and wrapper node components. These components work together to enable the VM to operate independently on top of the PWR Chain base layer, while providing compatibility with existing wallets and tools.

By leveraging the handler node for transaction filtering and validation, and the wrapper node for wallet compatibility, developers can create VMs that offer a seamless and secure user experience. The integration of these components into the RPC node of the VM streamlines the interaction process and simplifies the deployment and management of VMs on PWR Chain.

As PWR Chain continues to evolve and provide enhanced tools and frameworks for VM development, building virtual machines on this innovative blockchain platform will become increasingly accessible and efficient, opening up new possibilities for developers and users alike.
