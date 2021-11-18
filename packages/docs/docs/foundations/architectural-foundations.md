---
sidebar_position: 1
---

# Architectural Foundations

## Introduction

Verity is based on decentralized identity standards and concepts, which place individuals directly in control of their data.

This approach is enabled by W3C Verifiable Credentials (VCs). A _credential_ is simply a claim made by an issuer about an individual, or _subject_, and a _verifiable credential_ can be viewed as a cryptographically-secure wrapper around the credential.

In a typical decentralized identity deployment, the individual directly requests and receives credentials from an issuer, storing them in a digital wallet. Individuals decide when and with whom they want to share their credentials, referred to as "verifiers", or more generally, "relying parties".

<img src="/img/docs/vc_ecosystem.png" alt="Verifiable Credentials Ecosystem" width="600"/>

The relying party is able to verify the credential, without necessarily needing to contact the issuer, through an extensible mechanism described in the VC spec. The verification process is designed to be privacy-respecting and cryptographically secure.

## Credential Flows

This section more precisely describes end-to-end credential flows. These flows can be simplified or adapted; for example, if the issuer already knows the data to include in subject's credential, the "Request Credential" step can be skipped.

<img src="/img/docs/vc-flows.png" alt="Verifiable Credentials Flows" width="600"/>

### Issuance

1. **Request Credential**: Decentralized identity issuance flows typically start with the subject requesting a credential from the issuer. This request includes information such as:
   - the subject-controlled identifier (described further below) to issue to, along with a proof of control
   - other input credentials requested by the issuer
2. **Issue Credential**: The issuer validates the request, issues a credential to the identifier specified by the subject, and returns the credential

### Verification

1. **Request Credentials and Proof**: the verifier (or relying party) requests credentials and proof from the subject/holder

2. **Submit Credentials**: the subject/holder presents the credentials to the relying party, typically including cryptographically signed proof.

## Standards and Concepts

### Verifiable Credentials, Verifiable Presentations

<img src="/img/docs/creds.png" alt="Verifiable Credentials and Verifiable Presentations" width="600"/>

[W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) are a flexible, tamper-evident way for an issuer to make a claim about a subject in a way that is independently verifiable and privacy-preserving. VCs are the data model used for Verity claims

**Verifiable Presentations**, also defined in the VC spec, are a way to securely package a set of VCs for transmission to a relying party, in a way that also allows subjects to prove control over the credentials.

### Identifiers, Decentralized Identifiers

<img src="/img/docs/did.png" alt="Decentralized Identifier" width="600"/>

An "identifier" refers to both a subject and an issuer of a VC. The identifier data type is a URI, one of which is a [W3C Decentralized Identifiers (DIDs)](https://www.w3.org/TR/did-core/), which is used in Verity implementations. Verity does not require the use of DIDs, but these are one way to implement identifiers that minimize correlatability and enable proof of control over credentials.

### Verifiable Data Registry

The Verifiable Data Registry is a general concept that enables decoupling of verification from the issuer. it's typically used for storing revocation registries, trusted issuer lists, or similar data repositories, to be accessed during the verification process. In VC implementations, these are often implemented with distributed ledger (note that in the Verity approach, the credentials themselves are not stored on-chain).

### Credential Issuance and Exchange

Continuing the standards-based approach, Verity uses two emerging decentralized identity standards for requesting and exchanging a credential.

<img src="/img/docs/standards.png" alt="Verifiable Credentials Exchange Standards" width="600"/>

#### Credential Manifest

On the issuance side, [DIF Credential Manifest](https://identity.foundation/credential-manifest/) allows an issuer to describe (in a machine-readable way) what types (schemas) of credentials they issue, and what their requirements are. It also describes the format for a subject/holder to submit an application for a credential that conforms to those requirements in a machine-readable way.

#### Presentation Exchange

On the exchange side the [DIF Presentation Exchange](https://identity.foundation/presentation-exchange) allows a verifier to describe what types of credentials they require from a subject/holder, and how the subject/holder can send a submission.

Both of the above specs are data formats that may be used in a variety of protocols.

#### Wallet and Credential Interactions

There are a variety of emerging patterns for decentralized identity protocols. The Verity protocol has selected a lightweight flow based on the work-in-progress [DIF Wallet and Credential Interactions](https://identity.foundation/waci-presentation-exchange/) spec.

TODO -- define terms:

- Credential Offer
- Credential Request
- Credential Manifest
- Credential Application
- Credential Fulfillment
- Holder

### Revocation / Credential Status

TODO

## Complete List of Standards

- [W3C Verifiable Credentials Data Model](https://www.w3.org/TR/vc-data-model/)
- [W3C Decentralized Identifiers (DIDs) v1.0](https://www.w3.org/TR/did-core/)
- [DIF Presentation Exchange](https://identity.foundation/presentation-exchange)
- [DIF Credential Manifest](https://identity.foundation/credential-manifest/)
- [DIF Wallet and Credential Interactions](https://identity.foundation/wallet-and-credential-interactions/)
- [W3C Credential Status 2021](https://w3c-ccg.github.io/vc-status-list-2021/)
