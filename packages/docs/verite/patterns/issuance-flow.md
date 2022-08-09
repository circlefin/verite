---
sidebar_label: Issuing Credentials
sidebar_position: 0
---

# Issuing Verifiable Credentials

Identity providers can issue portable and decentralized Verifiable Credentials to their users. Verifiable Credentials represent provable claims associated with an identity. They can represent any number of claims -- proof of KYC, credit score, etc.

Verifiable Credentials are issued to a recipient-controlled identifier (such as a DID), which increases the ability for the recipient to use the credential in different contexts through [holder/subject binding techniques](https://identity.foundation/presentation-exchange/#holder-and-subject-binding) that prove control over an identifier.

Collecting that identifier in a secure and convenient way for the user requires different interaction flows; the following pattern is one way an issuer can enable this process for an authenticated user.

## Issuance Flow

In this example, an individual's financial institution offers the ability to request a KYC or credit score credential to be held in the individual's mobile identity wallet. The flow consists of the exchange of three distinct JSON objects:

1. A Credential Offer object published by the Issuer that describes the credential and how to apply for it
2. A Credential Application object submitted by the wallet, containing information that, when appropriately validated and/or verified, will form the contents of those credentials, and
3. A Credential Fulfillment envelope returned by the Issuer that contains the final credential(s) to be stored by the wallet and presented later to unknown future verifiers.


### Sample JSON objects

- [Credential Offer](/verite/appendix/messages#credential-offer)
- [Credential Manifest](/verite/appendix/messages#credential-manifest)
- [Credential Application](/verite/appendix/messages#credential-application)
- [Credential Fulfillment](/verite/appendix/messages#credential-fulfillment)

### Wallet-Bound Credential Issuance

In more detail, here is a flow for issuing a DID-bound (i.e., identity wallet-bound) credential to an identity wallet:

![Issuing a Credential](/img/docs/sequence_issuance.png "Issuing a Credential")

1. A User navigates to the Issuer site
1. The Issuer presents a QR code.
1. User scans the QR code with their wallet.
1. Wallet parses the QR code, which encodes a JSON object with a `challengeTokenUrl` property.
1. Wallet performs a GET request at that URL to return a Credential Offer, a wrapper around a [Credential Manifest](https://identity.foundation/credential-manifest/#credential-manifest-2), with three supplementary properties:
   - The issuer DID.
   - A URL for the wallet to submit a Credential Application.
   - A challenge to sign.
1. The wallet prompts the user to proceed. The Credential Manifest includes descriptive properties, e.g. in the Verite demo app a title and description of the credential are shown.
1. Once the recipient proceeds, the wallet prepares a signed [Credential Application](https://identity.foundation/credential-manifest/#credential-application),
   - If the wallet doesn't have a DID, it generates one.
   - The wallet creates a Credential Application for the DID.
   - The application is signed along with the challenge in the Credential Offer
   - The Verite library exposes a convenience method `createCredentialApplication` for this purpose.
1. Wallet submits the Credential Application to the URL found in the Credential Offer.
1. The Issuer creates a Verifiable Credential and returns it to the wallet as a [Credential Fulfillment](https://identity.foundation/credential-manifest/#credential-fulfillment).
1. Wallet persists the credential.

### Address-Bound Credential Issuance

In the case of credentials bound to a blockchain address, issuance is necessarily bespoke to a given wallet implementation, as few cryptocurrency wallets have standardized verification credential capabilities or even standardized secure storage.   In many use-cases, address-bound credentials are only recommended for addresses that are securely limited to a trusted wallet (whether hardware-secured, multi-signature, or EOA) whose signing control cannot be transfered or exfiltrated. 

As wallet standards emerge, guidance and potentially even full interface specifications will be forthcoming for how wallets can receive VCs, store them, and sign over them in live presentations.

For now, Verite recommends creating verifiable and replayable receipts of all off-chain wallet interactions (including issuance and delegated signing/presentation operations).  The Sign-In With Ethereum specification ([EIP-4361][]) is one such way of harmonizing on off-chain behavior, an approach being extended to other VMs in the [CASA][] by [CAIP-122][]. Receipts of these events can be logged as [CACAO][]s, for uniform verifiability.

[Presentation Request]: https://identity.foundation/presentation-exchange/#presentation-request
[Presentation Submission]: https://identity.foundation/presentation-exchange/#presentation-submission
[EIP-4361]: https://eips.ethereum.org/EIPS/eip-4361#example-message
[CACAO]: https://github.com/ChainAgnostic/CAIPs/blob/c8d8ee203625ea622bd15c42b2493116712dfaf3/CAIPs/caip-74.md
[CAIP-122]: https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-122.md
[CASA]: https://github.com/chainAgnostic/CASA