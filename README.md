# Verity

This repository contains demos and a shared "verity" library to illustrate the
issuance, verification, and revocation of [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/).

## Packages

The repository is set up as an [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces) (requires npm v7 or greater),
and as such, the dependencies for all included packages are installed from the root level using `npm install`.

The primary packages in this repository are:

- [@verity/contract](./packages/contract) - A solidity contract requiring KYC proof for higher-value transactions
- [@verity/demo-site](./packages/demo-site) - A demo walkthrough of the entire verity project, with additional demos for DeFi and custodial use cases.
- [@verity/core](./packages/verity) - Shared logic for issuing, verifying, and revoking Verifiable Credentials

In addition to the packages above, there are 3 single-purpose demo packages, largely extracted
from the `demo-site` package to help clarify each major function of verity credentials.

- [@verity/demo-issuer](./packages/demo-issuer) - A simplified demo of creating an issuer
- [@verity/demo-verifier](./packages/demo-verifier) - A simplified demo of creating a credential verifier
- [@verity/demo-revocation](./packages/demo-revocation) - A simplified demo of revoking credentials

## Mobile Wallet

There is also another repository, [centrehq/demo-wallet](https://github.com/centrehq/demo-wallet) which
contains code for a sample mobile wallet client which can be used to interact with all of the demos in
this repository.

## Getting Started

Local environment setup is handled by running the following script:

```sh
npm run setup
```

This script will do the following:

- Install all dependencies
- Build the `@verity/core` project
- Set up the local IP hostname for `@verity/demo-site` to be used with the wallet.
- Generate an auth JWT secret for `@verity/demo-site`
- Generate issuer and verifier DIDs and secrets for `@verity/demo-site`
- Build and migrate the database for `@verity/demo-site`

## Running the Demos

To run the entire suite of demos, you should first start a [HardHat](https://hardhat.org)
ethereum node.

```sh
npm run hardhat:node
```

then, in a new tab you can deploy our sample smart contract to that local node:

```sh
npm run hardhat:deploy
```

And finally, you can run the local demos:

```sh
npm run dev
```

This will start your server at [http://localhost:3000](http://localhost:3000)

### Manually running services

It is recommended that you run `npm run clean` before manually running a service.

#### @verity/demo-site

First, you should follow the above steps for deploying the contract to
a local hardhat node.

Instead of running `npm run dev`, you'll build Verity on it's own:

```sh
npm run build:verity
```

Now you can run the `demo-site`:

```sh
npm run dev:site
```

#### @verity/core

To build the shared `@verity/core` package, run:

```sh
npm run build:verity
```

To watch for changes to `@verity/core`, run:

```sh
npm run dev:verity
```

#### @verity/contract

Run a standalone ethereum network using hardhat in a separate terminal

```
npm run hardhat:node
```

Deploy the contract

```
npm run hardhat:deploy
```

Run the contract test suite

```
npm run hardhat:test
```

Add funds to the in-app faucet. In development, the faucet address is `0x695f7BC02730E0702bf9c8C102C254F595B24161`, so the following command will supply it with funds:

```
npm run hardhat:faucet 0x695f7BC02730E0702bf9c8C102C254F595B24161
```

You can find more [detailed information](./packages/contract) in the package.

#### @verity/demo-issuer

First, ensure `@verity/core` is built.

```
npm run build:verity
```

Then start the `demo-issuer` demo from the package directory:

```
cd packages/demo-issuer
npm run dev
```

#### @verity/demo-verifier

First, ensure `@verity/core` is built.

```
npm run build:verity
```

Then start the `demo-verifier` demo from the package directory:

```
cd packages/demo-verifier
npm run dev
```

#### @verity/demo-revocation

First, ensure `@verity/core` is built.

```
npm run build:verity
```

Then start the `demo-revocation` demo from the package directory:

```
cd packages/demo-revocation
npm run dev
```

## Testing

Run tests by running

```
npm run test
```

**NOTE** Be sure to have built the `@verity/core` package by running `npm run build:verity`.

## Developing

To run type-checking, linting, and tests, simply run:

```
npm run check
```

### Linting the codebase

```
npm run lint
```

or, with autofix:

```
npm run lint --fix
```

### Fixing with Prettier

This app uses [Prettier](https://prettier.io), and you can auto-format all files with

```
npm run format
```

### Database

The `demo-site` uses a local sqlite database to maintain state, and uses
[prisma](https://prisma.io) to access the database via code.

There are several database scripts which can be helpful during development:

#### Migrate the database

```
npm run db:migrate
```

#### Reset local database (rebuild and seed)

```
npm run db:reset
```

#### Seed local database

```
npm run db:seed
```

#### Inspect local database contents

```
npm run prisma studio
```

## Contributors

- [Kim Hamilton Duffy](https://github.com/kimdhamilton) ([Centre Consortium](https://centre.io))
- [Sean Neville](https://github.com/psnevio) ([Xdotzero](http://xdotzero.com))
- [Brice Stacey](https://github.com/bricestacey) ([M2 Labs](https://m2.xyz))
- [Matt Venables](https://github.com/venables) ([M2 Labs](https://m2.xyz))
