---
sidebar_label: Architecture Overview
sidebar_position: 2
---

# Architecture Overview

Verity’s identity topology is attestation-based. Real-world entities, such as individuals and institutions, own several identity contexts. One human entity may have a financial identity, a healthcare identity, a university identity, etc. Each of those unique identity contexts have claims attributes associated with them.

![Verity's identity topology is attestation-based](/img/design-overview/topology.png)

Verity is primarily focused on those identity claims and how to prove them to others without sharing more data than is needed (data minimization) and without relying on others to control the claims or control the act of sharing them.

The decentralized identity architecture enables an individual (subject/holder) to request and receive cryptographic attestations about identity claims from a credentials issuer. Individuals can custody and manage these attestations in their crypto/identity wallets. In this model, individuals decide when and with whom they want to share their credentials, referred to as verifiers, or more generally, relying parties.

![Identity relationship between issuer, subject, verifier, and registry](/img/design-overview/identity-relationships.png)

The relying party verifies the credential, without necessarily needing to contact the issuer, through an extensible mechanism enabled by the Verifiable Credentials specification. The verification process is designed to be privacy-respecting and cryptographically secure.

Verity endorses the W3C Verifiable Credentials (VCs) Data Model. A credential is a claim made by an issuer about an individual (subject), and a verifiable credential is a cryptographically secure wrapper around the credential.

Foundational standards that Verity draws upon include:

- **W3C Verifiable Credentials (“VCs”):** flexible, tamper-evident way for an issuer to make a claim about a subject in a way that is independently verifiable and privacy-preserving. VCs are the data model used for Verity claims
- **Verifiable Presentations:** also defined in the VC spec, are a way to securely package a set of VCs for transmission to a relying party, in a way that also allows the subject to prove control over the credentials.
- **Identifiers, Decentralized Identifiers:** an "identifier" refers to both a subject and an issuer of a VC. The identifier data type is a URI, one of which is a W3C Decentralized Identifiers (DIDs), which is used in Verity implementations. Verity does not require the use of DIDs, but these are one way to implement identifiers that minimize correlability and enable proof of control over credentials.
- **Verifiable Data Registry:** a general concept that enables decoupling of verification from the issuer. it's typically used for storing revocation registries, trusted issuer lists, or similar data repositories, to be accessed during the verification process. In VC implementations, these are often implemented with a distributed ledger (note that in the Verity approach, the credentials themselves are not stored on-chain).
- **Credential Manifest:** standard from the Decentralized Identity Foundation (DIF) for requesting and receiving a credential. Credential Manifest allows an issuer to describe (in a machine-readable way) what types (schemas) of credentials they issue, and what their requirements are. It also describes the format for a subject/holder to submit an application for a credential that conforms to those requirements in a machine-readable way.
- **Presentation Exchange:** A DIF standard enabling a verifier to describe what types of credentials they require from a subject/holder, and how the subject/holder can send a submission. See DIF Presentation Exchange
- **Wallet and Credential Interactions:** wallet interaction protocols use a lightweight flow loosely based on the work-in-progress DIF Wallet and Credential Interactions spec.

### Key Standards References:

- [W3C Verifiable Credentials Data Model](#)
- [W3C Decentralized Identifiers (DIDs) v1.0](#)
- [DIF Presentation Exchange](#)
- [DIF Credential Manifest](#)
- [W3C Credential Status 2021](#)
- [DIF Wallet and Credential Interactions](#)
