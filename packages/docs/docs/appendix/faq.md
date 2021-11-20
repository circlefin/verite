---
sidebar_label: FAQ
sidebar_position: 4
---

# Frequently Asked Questions

Decentralized identity standards are new and evolving, with a range of alternatives to choose from at each layer of the technical stack. The design decisions used for Verity were not meant to be exclusive; rather to provide a simple, layered approach to maximize reusability (integratability)

## Signature Suite

Verity's issuing libraries sign Verifiable Credentials with the did-vc-jwt signing approach

### Minimal Claims

A further simplification was enabled by the assumption that the issued/exchanged credentials themselves would be single-purpose, e.g., with the goal of expressing simple statements not requiring ZKPs, contain minimal personal data, and be under the control of a self-custody wallet holder.

### HTTP transport

Consistent with the goal to ease integration into other technical stacks, this uses http instead of didcomm-http. This approach assumes a context between the wallet holder and relying parties that do not require general message passing and discovery.

### Issuance and Exchange

For completeness, this spells out complete issuance and exchange flows. The Issuance Flow is adapted from WACI / Credential Manifest.

- didcomm and routing: out of scope

## Changes made to WACI

1. Update the structure to mirror the current [WACI Presentation Exchange document](https://github.com/decentralized-identity/waci-presentation-exchange).
2. Propose a framework for describing new WACI profiles, similar to [WACI Presentation Exchange](https://github.com/decentralized-identity/waci-presentation-exchange) layer cake selection of existing specifications and protocols to match specific design goals.

### Technical

#### Proof Formats

##### Which VC proof formats are supported?

Initially, VC JWT signatures are supported, but JSON-LD support may be added in the future.

The reason: JWTs already have broad adoption and cross-language open-source library support. JSON-LD proofs are pre-standard status and have fewer options for mature, open-source implementations. Nonetheless, JSON-LD proofs are receiving interest in the VC community because of their suitability for selective disclosure techniques, as described by the [LDS BBS+ Signature Suite](https://w3c-ccg.github.io/ldp-bbs2020/).

For additional context, see the [VC Implementation Guide ](https://www.w3.org/TR/vc-imp-guide)sections:

- [https://w3c.github.io/vc-imp-guide/#benefits-of-jwts](https://w3c.github.io/vc-imp-guide/#benefits-of-jwts)
- [https://www.w3.org/TR/vc-imp-guide/#benefits-of-json-ld-and-ld-proofs](https://www.w3.org/TR/vc-imp-guide/#benefits-of-json-ld-and-ld-proofs)

##### Which VC signing/verifying libraries are you using?

See the [list of specifications and spec-conforming libraries](/docs/appendix/specifications-and-libraries) used by Verity.

##### There are several JWT variations referenced in the VC-DATA-MODEL; which one are we using?

The encoding generated and interpreted by [DIF’s did-jwt-vc library](https://github.com/decentralized-identity/did-jwt-vc/) appears to be the most broadly used (currently) version. We are tracking upcoming work in DIF to further improve standardization.

##### Does Verity use / support ZKPs?

Selective disclosure or zero-knowledge proof techniques may be useful for the counterparty credential, allowing users to selectively disclose claims in it rather than all claims. For the Travel Rule, the Beneficiary counterparty does not need to disclose as much as the Originator counterparty does.

We won’t demo these in the initial release because of the decision to support JWTs and not JSON-LD proof formats.

Details: Currently, BBS+ signatures only work with JSON-LD proofs[^3] (they rely on RDF framing). There is interest in an approach under the JOSE umbrella but none have been proposed yet. The only other alternative I’m aware of is CL signatures, which are very complex.

##### Why are VCs wrapped in VPs?

TODO

_When a holder transmits a credential to a verifier, Verifiable Presentations make sense to prevent replay attacks and prove the holder is the same as the subject, but why would a VP be needed upon issuance?_

First, note that even if a VP is involved, from a VC-DATA-MODEL perspective, a proof/signature isn’t required.

There are several considerations/contexts for VPs:

1. Security
   1. For JSON-LD signatures, wrapping an issued VC in a VP is especially recommended when crossing trust domains, but isn’t technically necessary when already over a trusted channel
   2. Otherwise, for JWT signatures, the signature component already addresses these concerns
2. Packaging multiple VCs 3. The other factor behind use of VPs is that they can serve as a wrapper for an array of VCs, so if the issuer intends to return multiple, this can be a convenient structure
3. Protocol Data Models 4. Lastly, some VC issuance protocols always use VPs, but that can be a simplification of the above factors

In our use cases, we are assuming issuance and receipt of the credential over a trusted channel. Our initial use cases focus on the issuance of 1 credential. So the protocol data models will be our primary driver, but we can omit the proof if desired (see

[related question](#heading=h.zcqkdxprp70))

#### VC Issuance/Exchange Protocols

##### For issuance sequences, should we use the credential manifest and submission formats defined in DIF’s Credential Manifest Spec or not?

A related draft specification of ongoing interest is OIDC Credential Provider ([https://mattrglobal.github.io/oidc-client-bound-assertions-spec/](https://mattrglobal.github.io/oidc-client-bound-assertions-spec/)). In the current form, it proposes data formats that are alternatives to the manifest and submission formats proposed in credential manifest spec. However, the credential manifest spec defines a way to reconcile both approaches, allowing credential manifest payloads to be used within the OIDC Credential Provider flow.

#### DID Methods

##### Does Centre care what DID method and resolver anyone uses?

Centre’s selection of decentralized identifier methods is not intended to be prescriptive. Our implementation choices were made based upon technical feasibility, availability of open source specifications/implementations, no/low fee, and the ability for issuers, verifiers, and holder wallets to resolve DIDs without relying on a specific tenant or chain.

For these reasons, Centre expects to demonstrate did:key, did:web, and (optionally) did:ion.

In general, DID method options will be influenced by a broader set of criteria relevant to all roles in the VC ecosystem, a comprehensive consideration of which is available in the DID Method Rubric (https://w3c.github.io/did-rubric).

##### Should the RI/demos include did:ion and anchoring to a chain at all?

Anchoring to public chains is useful, though, for making DIDs truly portable. Anchoring approaches that reduced fees/gas were also preferred, mostly resulting in batched change state anchoring, avoiding one op == one chain tx. This ruled out a number of crypto-specific identity solutions providers, but supported operation anchoring in Bitcoin and Ethereum, among others. It also eliminated a concern from regulators about promoting or requiring token usage.

ION and its use of Sidetree enable anchoring batches of updates to a chain, notably Bitcoin. It’s not required, but a good illustration of ensuring censorship-proof portable identity.

#### Various

##### Are DIDs, VCs, or VPs meant to be public or private?

A Decentralized Identifier (DID) is a globally unique URI that resolves to a DID document, which contains public keys (or encoded multi-hashes of public keys), service URLs, and other verification methods. DIDs may be used to identify the subject and the issuer of a Verifiable Credential, as well as a holder of a Verifiable Presentation.

Special consideration should be given to DIDs, VCs, and VPs when applied to personal data, including how they are stored and who has access to them.

Access to VCs should be under the control of the subject (or a holder authorized to act on behalf of the subject), and they should never be stored publicly or on a chain.

DID documents may be publicly accessible[^4], and while at face value DIDs and DID Documents appear to contain no personal data, there is a risk that third parties may over time use them to correlate data about an individual, enabling tracking or discovery of additional information unintended by the subject. Some approaches to mitigate this risk include single-use DIDs, DIDs specific to a (pairwise) relationship, hierarchically-generated DIDs, or data minimizing signature suites that conceal DIDs.

Verifiable Presentations are assumed to be created on the fly, never generated in advance or persisted, and used only in a given session of claims exchange.

Additional consideration of privacy considerations described above are available in the DID Core specification ([https://www.w3.org/TR/did-core/#privacy-considerations](https://www.w3.org/TR/did-core/#privacy-considerations)) and the DID Implementation guide ([https://w3c.github.io/did-imp-guide/#privacy-considerations](https://w3c.github.io/did-imp-guide/#privacy-considerations)).

##### How critical is it to avoid associating credentials with long-lived DIDs?

Privacy may erode if relying parties are able to associate different credential presentations with the same subject. The previous section described approaches which may or may not be available to an individual, depending on technical decisions made by the issuer, relying parties, and their wallet software.

One relatively (technically) easy approach is for issuers to re-issue a credential to a given person with a new DID they present -- accompanied with expiration or revocation of the previously issued credential. However, issuers should avoid relying exclusively on this method and imposing it on individuals; at the extreme it increases the individual’s dependency on the issuer (e.g., the need to request credential issuance every time it is used). Our implementation will allow re-issuance as a choice by the credential holder.

##### If using libp2p for peer node communication, should the serviceEndpoints be multiaddrs?

An early POC assumed serviceEndpoint values in DIDs were libp2p multiaddrs, since libp2p enabled private VC request/exchange and other DID comms. This could have changed to DIDComm, or something else such as Textile, Ceramic, or other systems that embed and wrap libp2p.

The current approach doesn’t use libp2p or rely on peer communication, and doesn’t require approaches like DIDComm or DID messaging. So this question is no longer relevant.

##### Should Centre use existing schema.org definitions for its data models instead of creating new ones?

_For example, should Centre use RegisterAction or something similar to represent KYC instead of creating a bespoke model?_

We plan to compose simple but custom schemas, but also use well-known schemas (such as “Person”) when appropriate.

##### What credential revocation mechanism are we using?

We’re using VC Status List 2021 for our revocation approach:

- Spec: [https://w3c-ccg.github.io/vc-status-list-2021/](https://w3c-ccg.github.io/vc-status-list-2021/)
- Repo:[ https://github.com/w3c-ccg/vc-status-list-2021](https://github.com/w3c-ccg/vc-status-list-2021)

This method uses a verifiable credential which holds a bitstring into which a revocable credential can be indexed, with 0 == not revoked and 1== revoked. Revocable credentials then reference their revocation credential location and the index which corresponds to their own status in the list.

For each revocable credential that a sample kyc issuer issues, the issuer must internally persist:

- the internal customer id used for the credential (the customer id used for the actual kyc process),
- the credential type (assume the issuer may have multiple revocable credential types, but that it doesn’t matter if the customer has multiple credentials of the same type, they will either all be revoked or none will),
- which revocation credential to use (default size holds 131,072 revocable credentials in each single revocation credential),
- the index of the revocable credential in the revocation credential’s list

When revoking kyc credentials for a customer, the sample issuer gets all credentials of the kyc type for that customer id, iterates over them and finds their revocation credential, and regenerates the bitstring in that credential with the index for the revoked credential set to 1.

##### Style question: for Centre’s published JSON models, camelCase or snake_case for the names? kycAmlAttestation.json or kycaml_attestation.json?

It’s currently camelCase where we had a choice, but have no strong opinion. Referencing multiple schemas means the format is likely to be inconsistent anyway since there’s no consistency across external schemas.

### General / Project Scope

##### Why decentralized identity, web3, etc?

We have a thesis that decentralized identity solutions and web3 tech can be leveraged to improve risk analysis -- while also addressing compliance requirements more effectively at scale than centralized solutions can -- in line with the crypto ethos that empowers customers, and in a way that enables more sophisticated DeFi interactions.

##### Why don’t Circle and Coinbase just use an existing solution? Why is Centre building anything?

Centre is helping to define missing JSON schemas and protocols (recipes for interaction) that make whatever solution Circle uses interoperable with whatever solution Coinbase uses, and Visa and others. Centre is also illustrating the specific versions and variations it endorses among existing occasionally confusing and overlapping identity specifications and proposals.

In addition to those missing agreed-upon data models, existing solutions also do not define a common recipe for how to request claims, without a known DID, from an unknown holder, and in the context of blockchain transactions. Typically in decentralized identity scenarios, a verifier requests claims from a holder of a DID; but in Centre’s cases, only a blockchain transaction is known when receiving funds, no DID or holder of claims is known, and no way of finding one is prescribed. Centre can define such a recipe that is implementable across a broad number of solutions.

These are data model and recipe building blocks that need to be interoperable to support a variety of use cases, including the regulatory-related ones that threaten USDC.

##### What are the expected final deliverables?

1. JSON schemas to define the structure of new Verifiable Credential claims for those that have not been registered as standards already, to support member use cases. These include proof of KYC, proof of blockchain address ownership, schema for credit/risk rating, and schema for counterparty compliance.
2. A written specification of a recipe defining how to request and receive claims for verification across any compliant smart contract and wallet, including bootstrapping the sequence from a pending blockchain transaction.
3. Sample code ("Reference Implementation") and tests illustrating the implementation of the schemas and recipe spec.

##### Does Centre’s engagement with the DIF conflict with any similar engagement from Coinbase or Circle?

Centre is not expecting either Circle or Coinbase to join or otherwise commit any resources to the DIF or other standards groups. But since Centre exists to improve interoperability between solutions that members and others provide, Centre itself needs to interface with relevant organizations to ensure interoperability with other solutions in the DID space. The aim is to prevent siloed development of data definitions that not everyone agrees on, or interprets differently. This is important when network effects and portability matter more than vendor lock-in and platform control, even (or especially) among competitors.

##### Should we demonstrate browser-based credential storage?

Yes, as a secondary priority behind mobile. One option is a dev version of MetaMask.

##### What are general steps to completion?

1. Commit to Goals, Non-Goals, Use Cases, Deliverables
2. Resource the project with people and capital
3. Deliver schemas, recipe spec, and sample code with tests
4. Announce publicly, demo use cases, open RI repo and publish spec on site
5. Support integrations with Circle, Coinbase, et. al.

##### Is localization required?

Localization isn’t required in the initial demonstration release, but will be added subsequently.

##### Where’s a brief summary of DID, VC, VP?

[https://docs.google.com/document/d/1G1QFZOPue8ca4_USLPaQZn0WFtPh_CXLou8LbNtU9IM/edit?usp=sharing](https://docs.google.com/document/d/1G1QFZOPue8ca4_USLPaQZn0WFtPh_CXLou8LbNtU9IM/edit?usp=sharing)

##### How broad should the reference code be, should it deliberately illustrate usage in a wide number of solutions or deliberately stay minimal?

_For example, should it demonstrate usage in popular stacks / solutions like Indy/Aries, Spruce, Ceramic, Textile, Veramo, Bloom, Sovrin, and Evernym?_

We decided to keep the reference code minimal. The reference/sample code is not prescriptive, and isn’t meant to force any one choice of vendor solution. Centre is specifying shared definitions and an example of their usage. Many of the DID solutions are larger and more vendor-promoting than Centre needs for its core use cases, so there’s a preference for simple open source libraries.

##### What is the criteria for library selection?

Open-source, doesn't lock in to vendor, compatible with react-native (mobile)

##### What is the granularity of the VC proving account/address private key ownership?

Is the mapping always one-to-one or hierarchical via something like a merkle root to represent a wallet DAG? Are credentials generated with one claims entry and proof (signature from private key) per address/key, or would a collection of child keys from a single wallet create a single proof in the claim?

Note: we are just handling address-level

##### For the Travel Rule solution, a tx pool concept is used to publish requests to a pool and enable observing nodes to reply to the request’s callbackUrl with a presentation. The POC used IPFS pubsub to simulate a global tx pool, but what is the preferred implementation? Something leveraging an existing cross-chain tx pool?

We are using libp2p

<!-- Footnotes themselves at the bottom. -->

## Notes

[^1]: As of 6/2021, a W3C Working Group for JSON-LD Signatures is pending creation (reference: [https://lists.w3.org/Archives/Public/public-credentials/2021May/att-0082/2021-Linked-Data-Security-WG-Charter.pdf](https://lists.w3.org/Archives/Public/public-credentials/2021May/att-0082/2021-Linked-Data-Security-WG-Charter.pdf))
[^2]: While there are open source implementations, all are tied to specific vendors
[^3]: JSON-LD (LD = Linked Data) proof techniques enable isolation of individual statements in a claim, as opposed to an opaque blob, which is essential to how the [BBS+ LD Signature Suite](https://w3c-ccg.github.io/ldp-bbs2020/#the-bbs-signature-suite-2020) functions.
[^4]: Depending on the implementation choices of the DID method
