# Demo Verifier

This is a simple example of how to verify a credential with a self-custodied identity wallet.

The page first prompts a compatible mobile wallet to scan a QR code. The data encoded includes a unique request identifier and a challenge to be signed, helping tie the mobile wallet holder to the current authenticated browser session and the given verification request.

Using [Presentation Exchange](https://identity.foundation/presentation-exchange), the server can define the constraints that satisfy its requirements. The mobile wallet can then submit credentials for verification.

To use the resulting verification in an Ethereum smart constract, the verifier will return a signature using [EIP-712](https://eips.ethereum.org/EIPS/eip-712).

## Getting Started

This package is set up as an [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces) (requires npm v7 or greater), and as such, the dependencies for all included packages are installed from the root level using `npm install`. Do not run `npm install` from this directory.

```sh
npm run setup
npm run dev
```

## Verification via Hosted Wallet

Verification via a hosted wallet could look the same, but the mechanism for sharing the `challengeTokenUrl` would be different. In this demo, we have the mobile wallet scan the QR code. In a hosted solution, we might have the user copy-paste the data, which is otherwise unweildy between devices. Then, the hosted wallet could behave just as a mobile wallet and continue verification.

The major difference between any solution is the medium of exchange. Given that hosted wallets are available 24/7, you could imagine a scenario where many hosted services participate in a shared mempool. Before a hosted wallet submits a transaction to network, it could broadcast to the mempool a Verification Request and counterparties could complete the verification request in real-time.

## Issuance to metamask

Issuance to metamask, or some browser-based extension wallet, is very similar. Since the verifying service is likely a web application, it could interact with MM as if it were a dApp. Note that this is contingent on metamask actually supporting Verity.

## Contributors

- [Kim Hamilton Duffy](https://github.com/kimdhamilton) ([Centre Consortium](https://centre.io))
- [Sean Neville](https://github.com/psnevio) ([Xdotzero](http://xdotzero.com))
- [Brice Stacey](https://github.com/bricestacey) ([M2 Labs](https://m2.xyz))
- [Matt Venables](https://github.com/venables) ([M2 Labs](https://m2.xyz))
