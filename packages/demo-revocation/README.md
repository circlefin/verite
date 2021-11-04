# Revocation Demo

This is a simple example of how revocation works using [Status List 2021](https://w3c-ccg.github.io/vc-status-list-2021/). The revocation status is essentially stored in a compressed and encoded bitstring, with each credential having its own index. If the bit at the index is a 1, the credential is revoked. Otherwise, it's not revoked.

Since Verifiable Credentials cannot be tampered with (aka they are read-only), you cannot simply revoke them. Instead, the revocation status is stored in a separate credential, are referenced in the `credentialStatus` property, and can be retrieved at the given URL.

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

## Contributors

- [Kim Hamilton Duffy](https://github.com/kimdhamilton) ([Centre Consortium](https://centre.io))
- [Sean Neville](https://github.com/psnevio) ([Xdotzero](http://xdotzero.com))
- [Brice Stacey](https://github.com/bricestacey) ([M2 Labs](https://m2.xyz))
- [Matt Venables](https://github.com/venables) ([M2 Labs](https://m2.xyz))
