---
sidebar_label: Verifying Credentials
sidebar_position: 2
---

# Verifying Verifiable Credentials

As users collect more credentials, having to manually manage them (figuring out which are current, and which are appropriate for a given relying party) becomes infeasible. Unlike unstructured credentials (e.g., many .pdf files), which would require a user to manually select which data to share, verifiable credentials lend themselves to credential exchange protocols that are easier for end-users. These protocols are typically implemented for the user through the user's wallet (or other software agents) interacting with the requesting party.

Verity uses the concepts and data models from DIF's [Presentation Exchange](https://identity.foundation/presentation-exchange) for this purpose. This document describes how a consumer of Verifiable Credentials, referred to as a verifier or relying party, informs users what types/formats of credentials they accept, and how the user's wallet/agent uses this information to select the appropriate credentials and respond.

## Presentation Requests and Definitions

A [presentation definition](https://identity.foundation/presentation-exchange/#presentation-definition) is the way a relying party describes the inputs it requires, proof formats, etc. A [presentation request](https://identity.foundation/presentation-exchange/#presentation-request) is a generic term for a transport conveying this. It's meant to be flexibly embedded in a variety of transports, such as OIDC or [WACI](https://identity.foundation/waci-presentation-exchange/). Verity uses a JSON object that somewhat resembles the schema defined by WACI, but with additional fields including a challenge and reply URL.

## Wallet Interactions

Assuming a mobile wallet stores the credentials, for the convenience of the user a verifier may initiate the process of sending the presentation request either by scanning a QR code (desktop) or a deep-link (mobile). Due to size limitations of a QR code, wallet and credential interactions often do not include the full presentation request in the QR code; instead the QR code encodes an endpoint with a unique URL. The wallet decodes the QR code, subsequently retrieving the presentation request from that endpoint.

[See example Verity Presentation Request](/docs/appendix/messages#presentation-request)

## Credential Submission

The wallet parses the presentation definition to determine what types of inputs, proofs, and formats the verifier requires. The wallet displays a summary of the information requested to the wallet holder, asking for approval and/or asking the user to select the desired credential(s) from the set of matches. On confirmation, the wallet gathers the credentials and creates a verifiable presentation containing the credential and signs the presentation with the credential subject’s private key. It embeds the VP in a [presentation submission](https://identity.foundation/presentation-exchange/#presentation-submission), and signs it along with the `challenge` to provide [proof of identifier control](https://identity.foundation/presentation-exchange/#proof-of-identifier-control).

Finally, the wallet sends the packaged credential to the `reply_url` contained in the presentation request.

[See example Verity presentation submission](/docs/appendix/messages#presentation-submission).

## Verification

The verifier receives the presentation submission, unwraps it, and maps the presentation to the original presentation request. Mapping the submission to the original request can be done in many ways. The Verity demos use a JWT in the `reply_url` to store the mapping. Next, the verifier verifies the submitted contents against the required inputs, ensures its signed by the subject's keys, and checking the credential's status to determine if it is revoked out not.

Verification cannot always occur immediately. In these cases, the presentation request has an optional `status_url` that can be used to check its status.

There is no required output or side-effect of verification. However, we have a pattern for [integrating with Ethereum](/docs/patterns/smart-contract-verity) using an on-chain Verification Registry. A web app, however, might simply update its state and allow the user to continue some action.

## Verification Flow

In this specific example, a user wants to verify using their mobile wallet and have the resulting Verification Record to later register with a on-chain registry.

![Exchanging a Credential](/img/docs/sequence_exchange.png "Exchanging a Credential")

1. Verifier prompts user for the Ethereum address the Verification Record will be bound to
1. User provides their Ethereum address (e.g. copy pasting, or by connecting a wallet)
1. Verifier generates a JWT that encodes the user's address, that will later be used to generate the URL the mobile wallet will submit to.
1. Verifier shows QR Code
1. User scans QR Code with their wallet.
1. Wallet parses the QR code, which encodes a JSON object with a `challengeTokenUrl` property.
1. Wallet performs a GET request at that URL to return a Verification Offer, a wrapper around a [Presentation Request](#), with three supplementary properties:
   - The verifier DID.
   - A URL for the wallet to submit the [Presentation Submission](#), using the unique JWT generated earlier.
1. The wallet prompts the user to select credential(s) from the set of matches.
1. Wallet prepares a [Presentation Submission](#) including
   - Wallet DID is the holder, proving control over the DID. In the Verity examples, the holder must match the credential subjects, validating the holder and subject are the same.
   - Any Verifiable Credential(s) necessary to complete verification.
   - Wallet is the Presentation Request holder and signs it along with the challenge
1. Wallet submits the Presentation Submission to the URL found in the Verification Offer.
1. The Verifier validates all the inputs
1. Verifiers generates a Verification Record and adds it to the registry
