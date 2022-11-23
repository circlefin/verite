---
sidebar_position: 2
---

# Verite Issuer Registry NVP

The issuer registry non-viable product (NVP) is a simple demonstration issuer registry without the [proper governance structure](/verite/overview/governance-overview) in place. 

## Usage/Intent of the NVP Verite Issuer Registry

The NVP Verite Issuer Registry focuses exclusively on Issuer ID and authorization and leaves out of scope governance considerations. As such, this should be viewed as an experiment implementation for initial Verite issuers as the governance structure is being developed.

The NVG Verite Issuer Registry identifies entities authorized to issue Verite credentials (segmented by different credential types), along with associated metadata. 

On receipt of a Verite credential, a verifier confirms:
1. the issuer, identified by ID (typically a DID) is in the issuer registry
2. the issuer is authorized to issue the credential type

### Context of the Issuer Registry
The Issuer Registry, along with the Issuer Rules associated with credential types and processes ([described further in Verite Governance Overview](/verite/overview/governance-overview)), helps achieve determinism in Verite credential issuance, in the sense that identical identity claim inputs should lead, among different Verite issuers, to the same decision to issue, or not to issue, a credential. The NVP version of the Issuer Registry is an experimental placeholder while the MVP is being developed.

### Limitations, Assumptions, Scope (of this document and in general)

- Offchain verification: as Verite credential verification is an off-chain process, the issuer registry does not need to be on-chain
- Out of scope is Verite membership aspects of governance. 

## Design

The NVP issuer registry will be stored off-chain as a JSON file in Verite gihub repo (similar to Verite credential schemas and processes).

The structure, usage, semantics, and lightweight governance is described here.

All is to be interpreted as experimental for NVP and subject to revision.

### Roles

The following roles are referred to below
- Verite owners/administrators: 
    - Initially Verite github repo (centrehq) administrators.
    - Sole technical/logistic ability to approval and merge PRs 
    - Later to be replaced with real governance/membership scheme
- Verite participants:
    - Signing Verite CLA is prerequisite

### Implementation

- Verite issuer registry to be deployed as JSON file in Verite github repo: 
    - TODO: link to location
- As with Verite processes and definitions, this file can be referenced with a canonical (verite.id URL)

## Governance and Prerequisites

- Prerequisites: 
    - Organization must sign Verite CLA
    - No substantive objections from WG members, as determined by WG chair

- Process for updates to issuer registry:
    - Any individual by any organization covered by Verite CLA may open PR against Centre Verite github org 
    - Verite repo owners/administrators must review, approve, and merge


## Questions / To Decide

- Versioning and verification
    - How deep do we want versioning to go in MVG? 
        - Different versions resolvable through URLs? I.e. each "version" can be considered immutable
        - Or file updates with "date added/removed"
    - Timestamps at the issuer level or at the authorization level?  at the file level, at the 
        - Put differently, we need to decide the exact use cases. E.g. Do we want the verification process to ensure any VCs issued by the issuer _before_ they were added to the registry would be rejected? 
- Should link to registry be in vc itself?
    - I think this would be valuable
    - This would be a change to credential schema
- Do we want to include instrucions for removal from registry?
- Does the registry need signature? Or do github signed commits suffice?





