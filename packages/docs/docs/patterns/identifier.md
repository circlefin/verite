---
sidebar_position: 5
---

# Identifier Methods

Verifiable Credentials allow flexible methods for identifying the issuer, the subject, and holder. At the data type level, both can be any URI, which can be a web page, solid profile, a decentralized identifier (DID), etc.

The Verity implementation uses [did:key](https://w3c-ccg.github.io/did-method-key/) and [did:web](https://w3c-ccg.github.io/did-method-web/) for convenience and simplicity, but you should use the identifier method that is appropriate for your requirements. Specifically, did:key is a generative method meaning it can be resolved without lookup within a registry. This eliminates dependencies, can be done entirely off-line, etc. This leans itself well for Identity Wallet applications as it mimics the behavior or existing crypto wallets.

## Evaluating DID Methods

There are a large number of DID methods, some of which are based on blockchains, some based on web pages, and some purely generative. Some may support a complete range of DID operations like update, and others (like did:key) may not.

While implementors may choose any method they like, some common factors include:

- technical feasibility
- availability of multiple open source implementations (demonstrating interoperability)
- no/low fee
- the ability for issuers, verifiers, and holder wallets to resolve DIDs without relying on a specific tenant or chain

In general, DID method options will be influenced by a broader set of criteria relevant to all roles in the VC ecosystem, a comprehensive consideration of which is available in the [DID Method Rubric](https://w3c.github.io/did-rubric).
