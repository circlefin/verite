# Demo Issuer

This is a simple example of how to issue a credential to a self-custodied identity wallet.

The page first prompts a compatible mobile wallet to scan a QR code. The data encoded includes a JWT to help tie the mobile wallet to the current authenticated browser session.

The returned [Credential Manifest](https://identity.foundation/credential-manifest/) can be processed and show the user what is being requested.

Finally, we use [Presentation Exchange](https://identity.foundation/presentation-exchange) to request the credential.

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

You can read more about the Next.js folder structure in [their documentation](https://nextjs.org/docs/basic-features/pages).

## Issuance to a hosted wallet

Issuance to a hosted wallet would look the same, but the mechanism for sharing the `challengeTokenUrl` would be different. In this demo, we have the mobile wallet scan the QR Code. In a hosted solution, we might have the user copy-paste the data, which is otherwise unweildy between devices. Then, the hosted wallet could behave just as a mobile wallet and continue requesting the credential.

## Issuance to metamask

Issuance to metamask, or some browser-based extension wallet, is very similar. Since the issuing service is likely a web application, it could interact with MM as if it were a dApp. Additionally, MM being a wallet, it already has a set of keypairs that can be used to identify the user, however it could create its own for holding identity.

Note that this is contingent on metamask actually supporting Verity.

## Contributors

- [Kim Hamilton Duffy](https://github.com/kimdhamilton) ([Centre Consortium](https://centre.io))
- [Sean Neville](https://github.com/psnevio) ([Xdotzero](http://xdotzero.com))
- [Brice Stacey](https://github.com/bricestacey) ([M2 Labs](https://m2.xyz))
- [Matt Venables](https://github.com/venables) ([M2 Labs](https://m2.xyz))
