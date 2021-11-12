---
sidebar_label: Design Overview
sidebar_position: 1
---

# Design Overview

## Goals and Design Principles

Centre has a thesis that decentralized identity solutions can improve DeFi interactions and risk analysis while also addressing compliance requirements more equitably and effectively than centralized solutions, in a way that customers will embrace and in line with the crypto ethos.

An approach that utilizes decentralized identity standards promises to satisfy the following design principles:

- **Decentralized:** Requires no central issuing agency;
- **Persistent and portable:** Inherently persistent and long-lived, not requiring the continued operation of any underlying organization;
- **Cryptographically verifiable:** Based on cryptographic proofs and “code is law” rather than out-of-band trust and subjective interpretations of non-code law;
- **Resolvable and interoperable:** Open to any solution that recognizes the common data model, requires no one specific software implementation, including any that Centre may create;
- **Transparent:** Identity holders know when and how their identity data is being requested and used;
- **Private by design:** No data correlatable to an identity holder is exposed to a public or permissioned network, including registry mappings and blockchain persistence.

Interoperability is a key goal. Currently there is no industry-wide standard agreement on how products and services might interoperate in key crypto finance use cases, such as how they represent proof of KYC or accredited investor status. Centre aims to provide clarity by defining these standard connections and providing recipes to illustrate their usage.

Specifically, Centre’s goals are: (a) define data models (schemas) that should be shared and exist as common building blocks for all parties as a public good; and (b) define the protocols for requesting and delivering identity claims in a manner that supports member use cases, including critical DeFi use cases.

Centre approaches these goals through its primary partners and members (Circle, Coinbase, and the broader CeFi and DeFi USDC ecosystem) so that they can develop USDC-based products and solutions that are inherently compliant and interoperable with each other, but in a way that is open, transparent, and usable by anyone, whether connected to Centre and the USDC ecosystem or not.

## Non-Goals

- Centre does not have a goal of creating a new chain, token, consensus algorithm, wallet, storage system, p2p library, or other fundamental infrastructure.
- Centre does not have a goal of creating an SSI standard, or of implementing and delivering one to Centre customers. Centre aims to specify definitions for claims that can be used in any interoperable identity solution.
- Centre does not have a goal of creating a DID method and resolver, or any new software package that duplicates the identity infrastructure functionality of existing solutions.
- Centre does not have a goal of directly monetizing any reference implementation or specification it provides related to its goals and key use cases. Centre’s commercial success depends upon the broader success of USDC driven by its commercial members and partners.
