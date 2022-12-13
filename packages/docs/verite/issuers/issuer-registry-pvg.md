---
sidebar_position: 2
---

# Verite Issuer Registry PVG

The issuer registry pre-viable governance (PVG) is a simple demonstration issuer registry without the [proper governance structure](/verite/overview/governance-overview) in place. 

## Usage/Intent of the PVG Verite Issuer Registry

The PVG Verite Issuer Registry focuses exclusively on Issuer ID and authorization and leaves out of scope governance considerations. As such, this should be viewed as an experimental implementation for the initial Verite issuers as the governance structure is being developed, with only manual and Centre-governed additions and removals until such a time as Verite issuance can be communally self-governing.

The PVG Verite Issuer Registry identifies entities authorized to issue Verite credentials (segmented by different credential definitions); for each, it provides the exact issuer-service identifier (usually a DID) included in their Verite credentials, along with associated metadata. 

On receipt of a Verite credential, a verifier confirms:
1. the issuer, identified by ID (typically a DID) is in the issuer registry
2. the issuer is authorized to issue credentials containing attestations of type specified in the registry, andthe credential issuance date is later than `effectiveStart` and before`effectiveEnd`, if present.

### Context of the Issuer Registry
The Issuer Registry, along with the Issuer Rules associated with credential types and processes ([described further in Verite Governance Overview](/verite/overview/governance-overview)), helps achieve determinism in Verite credential issuance, in the sense that identical identity claim inputs should lead, among different Verite issuers, to the same decision to issue, or not to issue, a credential. The PVG version of the Issuer Registry is an experimental placeholder while the MVP is being developed.

### Limitations, Assumptions, Scope (of this document and in general)

- Offchain verification: as Verite credential verification is an off-chain procedure, the issuer registry does not need to be on-chain
- Authorizations happen at the attestation level, and attestation types must be defined under schemas/0.0.1
- Out of scope for PVG
    - Verite membership aspects of governance
    - Process-level authorizations and versioning

## Design

The PVG issuer registry will be stored off-chain as a JSON file in Verite gihub repo (similar to Verite credential schemas and processes).

The structure, usage, semantics, and lightweight governance is described here.

All is to be interpreted as experimental for PVG and subject to revision.

### Roles

The following roles are referred to below
- Verite owners/administrators: 
    - Initially Verite github repo (centrehq) administrators.
    - Sole technical/logistic ability to approval and merge PRs 
    - Later to be replaced with real governance/membership scheme
- Verite participants:
    - Signing the Verite Contributor License Agreement (CLA) is a prerequisite to be an issuer in the experimental phase or a co-designer of Verite credentials and tooling; once formal governance is launched, it will not be a requirement

### Implementation

- Verite issuer registry to be deployed as JSON file in Verite github repo. Initial version: packages/docs/static/registries/issuer-registry-0.0.1-pvg.json
- As with Verite processes and definitions, this file can be referenced with a canonical verite.id URL, e.g., https://verite.id/registries/issuer-registry-0.0.1-pvg.json

## Governance and Prerequisites

- Prerequisites: 
    - Organization must sign Verite CLA
    - No substantive objections from WG members, as determined by WG chair
- Process for updates to issuer registry:
    - Any individual by any organization covered by Verite CLA may open PR against Centre Verite github org 
    - Verite repo owners/administrators must review, approve, and merge
    - Github signed commits are required (they are enabled repo-wide on Verite github repo)
