---
title: Stateless vs. Stateful VIDAs
sidebar_position: 2
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Stateless vs. Stateful VIDAs

When building an Verifiable Immutable Data Application (VIDA), it’s important to understand the difference between stateless and stateful VIDAs. These two types of VIDAs serve different purposes and are designed for different use cases, depending on the criticality of the data and the level of consistency required.

## Stateless VIDAs

Stateless VIDAs are applications that do not need to validate or manage historical data or maintain a consistent state across its Execution Instances. They focus on simplicity, speed, and ease of development, making them ideal for non-critical use cases.

- Use Cases:

    - Global chat rooms
    - Simple games
    - Non-critical applications where speed and flexibility are prioritized

- Key Characteristics:

    - Do not track or validate past transactions or states.
    - Operate independently of historical data.
    - Prioritize fast execution and low overhead.

Stateless VIDAs are perfect for scenarios where consistency between execution instances is not a concern, and the focus is on rapid development and user interaction.

## Stateful VIDAs

Stateful VIDAs, on the other hand, are designed to manage critical data and ensure consistency across all execution instances. They validate both past and present data to guarantee the correctness of execution and maintain a synchronized state.

- Use Cases:

    - Financial systems (e.g., payment processing)
    - Supply chain management
    - Internal company operations (e.g., HR or ERP systems)

- Key Characteristics:

    - Validate historical data to ensure correctness.
    - Use mechanisms like cross-instance root hash validation or conduit root hash validation on PWR Chain to maintain consistency.
    - Focus on reliability, auditability, and trustworthiness for mission-critical applications.

Stateful VIDAs are essential for applications where data accuracy, consistency, and integrity are non-negotiable.

## Why This Distinction Matters

Understanding whether your VIDA should be stateless or stateful is critical because it impacts how you design, develop, and operate your application. Stateless VIDAs offer simplicity but may lack reliability for critical use cases, while stateful VIDAs provide robust guarantees at the cost of additional complexity. Choosing the right type ensures your VIDA aligns with your application's requirements and goals.
