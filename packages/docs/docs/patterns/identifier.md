---
sidebar_position: 4
---

# Identifier Methods

Verifiable Credentials allow flexible methods for identifying the issuer, the subject, and holder. The identifier data type is a URI, which can be a web page, Solid profile, a decentralized identifier (DID), etc.

The default Verity implementations use [did:key](https://w3c-ccg.github.io/did-method-key/) and [did:web](https://w3c-ccg.github.io/did-method-web/) for convenience and simplicity, but you should use the identifier method that is appropriate for your requirements.

On the subject/holder side, we chose did:key because it requires no fees or blockchain dependencies. It's a purely generative method, enabling resolution offline, without any registry lookups. This enables identity wallet applications to mimic the behavior of existing crypto wallets.

At the same time, did:key does not support key rotation, which is sometimes a desired DID method characteristic, especially for issuers. A simple option for issuers with long-standing web domains and established processes for pushing updates is to use did:web.

In the near future, Verity will add support for [did:ion](https://identity.foundation/ion/), a layer 2 DID solution that runs on the bitcoin network.

## Evaluating DID Methods

There are a large number of DID methods, some of which are based on blockchains, some based on web pages, and some purely generative. Some may support a complete range of DID operations like update, and others (like did:key) may not.

While implementors may choose any method they like, some common factors include:

- technical feasibility
- availability of multiple open source implementations (demonstrating interoperability)
- no/low fee
- the ability for issuers, verifiers, and holder wallets to resolve DIDs without relying on a specific tenant or chain

In general, DID method options will be influenced by a broader set of criteria relevant to all roles in the VC ecosystem, a comprehensive consideration of which is available in the [DID Method Rubric](https://w3c.github.io/did-rubric).
