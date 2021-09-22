# Demo Issuer

This is a simple example of how to issue a credential to a self-custodied identity wallet.

The page first prompts a compatible mobile wallet to scan a QR code. The data encoded includes a JWT to help tie the mobile wallet to the current authenticated browser session.

The returned [Credential Manifest](https://identity.foundation/credential-manifest/) can be processed and show the user what is being requested.

Finally, we use [Presentation Exchange](https://identity.foundation/presentation-exchange) to request the credential.

## Getting Started

```sh
npm run setup
npm run dev
```

## Issuance to a hosted wallet

Issuance to a hosted wallet would look the same, but the mechanism for sharing the `challengeTokenUrl` would be different. In this demo, we have the mobile wallet scan the QR Code. In a hosted solution, we might have the user copy-paste the data, which is otherwise unweildy between devices. Then, the hosted wallet could behave just as a mobile wallet and continue requesting the credential.

## Issuance to metamask

Issuance to metamask, or some browser-based extension wallet, is very similar. Since the issuing service is likely a web application, it could interact with MM as if it were a dApp. Additionally, MM being a wallet, it already has a set of keypairs that can be used to identify the user, however it could create its own for holding identity.

Note that this is contingent on metamask actually supporting Verity.
