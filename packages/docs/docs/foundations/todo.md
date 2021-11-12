---
sidebar_position: 999
---

# Various TODO

#### Verification Process

- The part common to all VCs -- not been tampered with
- Extensions: looking up status, DID documents, etci (preload contexts, DIDs, etc)
- Additional acceptance criteria: specific schemas, trusted issuer list, certification framework / compliance

#### Signing

- signing with challenge and domain
- keeping track of challenges, 1-time use

#### Architecture

- need discussion of flex points; not tied to xyz

* Designed minimally, to fit into a range of issuance and exchange protocols.

  - PE and CM to maximize reuse
  - Describe how to fit into different flows
  - Document how to fit into different (e.g. custodial) arrangements

* Factor in schema/stack selection: what will RP acccept
  - emerging
  - should be discoverable (well-known) or signed
  - may only accept certain signature suites

## Assumptions / Limitations / Out of Scope

- Assumes wallet holder has a relationship with issuer, uses existing auth method
- Assumes fine-grained credentials of starting point schemas
- Discovery, general message passing (e.g. DIDComm) out of scope
- Assumes self-custody / key managing wallet
- Reducing the number of pre-standard-version specifications and protocols required
- JSON and JWT signatures
- A further simplification was enabled by the assumption that the issued/exchanged credentials themselves would be single-purpose, e.g., with the goal of expressing simple statements not requiring ZKPs, contain minimal personal data, and be under the control of a self-custody wallet holder.

This enabled straightforward use of widely-adopted JSON and JWT, which are mature IETF standards and have broad library support, and have wide adoption in other existing standards.

TODO: blend in other relevant assumptions and link to others in FAQ

## About the Verity Wallet

Verity protocols are based on emerging open decentralized identity standards (TODO: learn more), allowing you to use your choice of standards-based credential wallets. The open-source Verity wallet is provided to demonstrate credential issuance and exchange flows. The wallet and its capabilities are described here.

### Capabilities

TODO: define terms

- Self-hosted (but hosted wallets are supported by the Verity protocols)
- Stores/manages credentials
- Stores/creates/manages decentralized identifiers
- Signs presentations
- DID methods supported: did:key (currently)
