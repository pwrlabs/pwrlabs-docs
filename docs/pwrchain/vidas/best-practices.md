---
title: Best Practices for Building High Performance VIDAs
sidebar_position: 2
---

# Best Practices for Building High Performance VIDAs

Building a Verifiable Immutable Data Application (VIDA) that scales to millions of users while staying trust-minimised requires a slightly different mindset than traditional smart-contract or Web 2 engineering. Below is an opinionated, field-tested checklist you can follow when performance is mission-critical.

## Configure web hosting without blowing the budget

- **Start with "zero-ops" platforms—just know the trade-off.** <br/>
   Services like Vercel or Railway are perfect for prototypes and light traffic, but the convenience premium stacks up once your site hits meaningful volume.

- **Graduate to raw cloud when you need granular control.** <br/>
    AWS, GCP, Azure, and similar providers charge closer to commodity rates and expose knobs (autoscaling, spot instances, savings plans) you simply can't tweak on fully-managed platforms.

- **Read the bandwidth fine print—loss-leader tiers bite back.**
    - A plan advertised as `$20/mo` for `1 TB + $0.20/GB` after means your second TB costs $200.
    - If the pricing table ends with "Contact us", assume a big jump—budget or negotiate in advance.
    - High-traffic apps that serve un-cached images, video, or large JS bundles will punch through those cheap tiers in days.

- **Reference stack for cost-efficient production on AWS:**
    - S3 + CloudFront - cheap, globally-cached static assets and SSL out of the box.
    - Lambda - pay-per-ms serverless functions; scales to zero when idle.
    - ECS Fargate or EKS - container orchestration without managing EC2 nodes.
    - RDS / Aurora Serverless v2 - relational data that auto-scales with load.

    This mix lets you dial resources up for traffic spikes and back down during lulls, keeping spend proportional to usage.

- **Protect yourself with budgets and alerts.** <br/>
Turn on AWS Cost Explorer, set per-service budgets, and configure e-mail/SNS alerts so any runaway spend is caught before the bill arrives.

## Understand the Execution Model

PWR Chain records **what** happened; your VIDA decides **how to react**.

* **No gas limits** - complexity lives off-chain.  
* **Predictable fees** - users pay per byte, not per opcode.  
* **Replayability** - anyone can rebuild state from chain logs.

Design every feature with this mental split.

## Pick the Right VIDA Flavor

### Stateless (fire-and-forget)

* **What**: Ignores history; acts on each tx once.  
* **Use when**: chat rooms, leaderboard pings, games where message loss is non-critical.  
* **Why**: Fast, minimal code.

### Stateful (consensus on data)

* **What**: Replays **all** VIDA-tagged txs, maintains DB / root-hash.  
* **Use when**: money, supply-chain, audits.  
* **Tips**  
  * Persist periodic state snapshots; include Merkle root in logs.  
  * Cross-validate roots among instances or via Conduits.

## Avoid unnecessary RPC calls to methods with static responses

* `chainId` always returns `0`
