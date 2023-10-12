# `verite`

This package contains the Verite Javascript SDK for requesting, issuing, consuming, and revoking Verifiable Credentials.

Note that this package was written with the intent of soliciting feedback, not with the intent of being published or used in a production environment. Extracting core logic to a package made logical sense for laying out the project, but primarily aided in more easily sharing common code between the demos and the demo-wallet.

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

### Building the library

This project is built using TypeScript, and needs to be built before it can be consumed by other packages.

From the root of the monorepo, run:

```sh
npm run build:verite
```

### Folder Structure

This packages contains all logic in the `/lib` folder.

```
lib/issuer/      Contains logic specific to issuing Verifiable Credentials
lib/verifier/    Contains logic specific to verifying Verifiable Credentials
lib/validators/  Contains logic for validating Verifiable Credential attributes
lib/utils/       Contains shared utility functions
```

## Contributors

- [Kim Hamilton Duffy](https://github.com/kimdhamilton) 
- [Sean Neville](https://github.com/psnevio) ([Xdotzero](http://xdotzero.com))
- [Brice Stacey](https://github.com/bricestacey) ([M2 Labs](https://m2.xyz))
- [Matt Venables](https://github.com/venables) ([M2 Labs](https://m2.xyz))
