---
sidebar_label: Issuer Setup
sidebar_position: 6
---

# Issuer Setup

Before issuing credentials, you will need to following at minimum.

1. Deciding what types of credentials to issue, and their schemas
   - Verite includes a few representative schemas, such as proof of KYC and chain address ownership.
   - See [Recommendations for Credential Schema Design](/docs/patterns/schema).
2. Decide what type of issuing identifier method (e.g., DID method) you want to use.
   - In order for verifiers to verify credentials, they must be able to determine your authorized signing keys.
   - If you are using a DID method, you will need to ensure you are signing credentials with keys resolvable from the DID.
   - See [Identifier Methods](/docs/patterns/identifier) for factors in this decision.
3. Allow users and credential wallets to discover how to interact with you as an issuer
   - In the flows described here, this starts with a QR code or deep link that the user opens from their credential wallet
   - The flow should enable the wallet to discover metadata about how to request and receive the credential
   - Verite uses [DIF Credential Manifest](https://identity.foundation/credential-manifest/) for this purpose. It allowa an issuer to describe what sort of credentials they issue, prerequisites for issuance, and output schemas
