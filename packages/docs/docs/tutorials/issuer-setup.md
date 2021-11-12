---
sidebar_position: 4
---

# Issuer Setup

This will describe various setup steps an issuer must do before issuing, including

1. Deciding what types of credentials to issue, including schemas
   - In the Verity reference, we've included a few representative schemas, such as proof of KYC and credit score.
   - Include information about supplying your own?
2. How to expose #1 info to credential recipients (and wallets)
   - Credential Manifests:
     - Verity's reference implementation uses DIF Credential Manifests to allow an issuer to describe what sort of credentials they issue
     - Issuer defines a credential manifest, which includes the prerequisites and output schemas
   - Issuer supplies a way for recipients to discover the credential manifest, such as adding a QR code or deep link into a mobile app on their web site: Verity encodes as a QR code in the demo-site
3. Decide what type of DID method to use (TODO: link to identifier best practices)
4. etc
