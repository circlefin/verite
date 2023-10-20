# Demo Verifier

This is a simple example of how to verify a credential with a self-custodied identity wallet.

The page first prompts a compatible mobile wallet to scan a QR code. The data encoded includes a unique request identifier and a challenge to be signed, helping tie the mobile wallet holder to the current authenticated browser session and the given verification request.

Using [Presentation Exchange](https://identity.foundation/presentation-exchange), the server can define the constraints that satisfy its requirements. The mobile wallet can then submit credentials for verification.

To use the resulting verification in an Ethereum smart constract, the verifier will return a signature using [EIP-712](https://eips.ethereum.org/EIPS/eip-712).

## Getting Started

### Requirements

- Node.js v14
- npm v7 or greater (`npm i -g npm@7`)

### Installation

This package is set up as an [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces) (requires npm v7 or greater), and as such, the dependencies for all included packages are installed from the root level using `npm install`. Do not run `npm install` from this directory.

From the root of the monorepo, run:

```sh
npm run setup
```

### Starting the app

From the root of the monorepo, simply run:

```sh
npm run dev
```

### Folder Structure

This app is built with [next.js](https://nextjs.org/). Next.js is a development framework for React which has automatic routing (based on folder structure), server-side rendering, and other optimizations. Next.js maintains a folder structure which maps directly to app routes. For example, the file `pages/hello.tsx` would map to the route `/hello`.

The folder structure is as follows:

```
pages/       Contains top-level React components which are treated as "pages" mapped to an HTTP route
pages/api    Contains Server-Side API routes
```

The root `App` React component is located in `pages/_app.tsx`. This demo contains only a single page, located at `pages/index.tsx`.

You can read more about the Next.js folder structure in [their documentation](https://nextjs.org/docs/basic-features/pages).

## Verification via Hosted Wallet

Verification via a hosted wallet could look the same, but the mechanism for sharing the `challengeTokenUrl` would be different. In this demo, we have the mobile wallet scan the QR code. In a hosted solution, we might have the user copy-paste the data, which is otherwise unweildy between devices. Then, the hosted wallet could behave just as a mobile wallet and continue verification.

The major difference between any solution is the medium of exchange. Given that hosted wallets are available 24/7, you could imagine a scenario where many hosted services participate in a shared mempool. Before a hosted wallet submits a transaction to network, it could broadcast to the mempool a Verification Request and counterparties could complete the verification request in real-time.

## Issuance to metamask

Issuance to metamask, or some browser-based extension wallet, is very similar. Since the verifying service is likely a web application, it could interact with MM as if it were a dApp. Note that this is contingent on metamask actually supporting Verite.

## Contributors

- [Kim Hamilton Duffy](https://github.com/kimdhamilton) 
- [Sean Neville](https://github.com/psnevio) ([Xdotzero](http://xdotzero.com))
- [Brice Stacey](https://github.com/bricestacey) ([M2 Labs](https://m2.xyz))
- [Matt Venables](https://github.com/venables) ([M2 Labs](https://m2.xyz))
