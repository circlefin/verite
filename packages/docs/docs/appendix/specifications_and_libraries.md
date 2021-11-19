---
sidebar_label: "Specifications and Libraries"
sidebar_position: 9
---

# Specifications and Libraries

> Note to Implementers: Decentralized Identity standards are emerging and at
> varying levels of maturity. Nonetheless, these standards are important to
> Verity’s design principles.
>
> To navigate this, the following specifications and libraries were selected
> for their promise of broadest adoption and interoperability. This list isn’t
> intended to be exclusive; support for additional standards may be added in
> the future.
>
> Further, Verity uses simplifications that remove the requirement for
> implementers to fully implement the referenced specifications. The flows and
> message structures described in this document suffice for wallet
> implementers.

| Specifications                                    | Reference                                                             |
| ------------------------------------------------- | --------------------------------------------------------------------- |
| W3C Verifiable Credentials Data Model             | https://www.w3.org/TR/vc-data-model/                                  |
| W3C Decentralized Identifiers (DIDs) v1.0         | https://www.w3.org/TR/did-core/                                       |
| DIF Presentation Exchange                         | https://identity.foundation/presentation-exchange                     |
| DIF Credential Manifest                           | https://identity.foundation/credential-manifest/                      |
| DIF Wallet and Credential Interactions (unstable) | https://identity.foundation/wallet-and-credential-interactions/       |
| W3C did:key Method                                | https://w3c-ccg.github.io/did-method-key/                             |
| IETF Multiformats Multibase                       | https://datatracker.ietf.org/doc/html/draft-multiformats-multibase-03 |
| IETF Multiformats Multicodec                      | https://datatracker.ietf.org/doc/html/draft-snell-multicodec-00       |

| Libraries                  | Reference                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------- |
| did-jwt-vc                 | https://github.com/decentralized-identity/did-jwt-vc                                  |
| did-resolver               | https://github.com/decentralized-identity/did-resolver                                |
| @transmute/did-key-ed25519 | https://github.com/transmute-industries/did-key.js/tree/main/packages/did-key-ed25519 |
