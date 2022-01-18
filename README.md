# Verite

Decentralized Identity for Crypto Finance.

This repository is a monorepo containing the Core Verite Javascript SDK, documentation, as well as several demos to illustrate issuance, verification, revocation, and real-world use-cases of the Verite standard.

## Getting Started

### Requirements

- Node.js v14
- npm v7 or greater (`npm i -g npm@7`)

### Project Structure

This repository is set up as an [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces) (which requires npm v7 or greater). The dependencies for all packages are installed from the root level using `npm install`.

Each package in this repository lives in the `packages/` directory.

The primary packages in this repository are:

- [docs](./packages/docs) - Documentation for the Verite
- [verite](./packages/verite) - The core Javascript SDK for issuing, verifying, and revoking Verifiable Credentials.
- [contract](./packages/contract) - Two sample ERC20 contracts showcasing how to implement Verite into a smart contract.
- [e2e-demo](./packages/e2e-demo) - A demo walkthrough of the entire Verite project, showcasing issuance, verification, and revocation, with additional demos for DeFi and custodial use cases.

In addition to the packages above, there are 3 single-purpose demo packages, largely extracted
from the `e2e-demo` package to help clarify each major function of Verite credentials.

- [verite/demo-issuer](./packages/demo-issuer) - A simplified demo of issuing Verifiable Credentials using `verite`.
- [verite/demo-verifier](./packages/demo-verifier) - A simplified demo of verifying Verifiable Credentials using `verite`.
- [verite/demo-revocation](./packages/demo-revocation) - A simplified demo of revoking credentials using `verite`.

Each package contains a README file with specific details about how to use the package.

#### Mobile Wallet

There is another repository, [centrehq/demo-wallet](https://github.com/centrehq/demo-wallet) which contains code for a sample mobile wallet client which can be used to interact with all of the demos in this repository.

The mobile wallet only runs on iOS at this time.

### Development Environment Setup

Setting up a new development environment is accomplished by running the following script:

```sh
npm run setup
```

This script will do the following:

- Install all dependencies
- Build the `verite` project
- Set up the local IP hostname for `@verite/e2e-demo` to be used with the wallet.
- Generate an auth JWT secret for `@verite/e2e-demo`
- Generate issuer and verifier DIDs and secrets for `@verite/e2e-demo`
- Build and migrate the database for `@verite/e2e-demo`

## Running the end-to-end Demo

When first starting, you will likely be most interested in the `./packages/e2e-demo` package. This package contains several demos and integrates deeply with `verite`.

This package contains several isolated demos. One of the demos showcases an Ethereum dApp integration, and requires running a local Ethereum node.

### Running a local Ethereum node

Running an Ethereum node is easily accomplished by using our built-in scripts for running a [HardHat](https://hardhat.org) node.

1. To start a local Ethereum node, simply run:

```sh
npm run hardhat:node
```

Now you have a local Ethereum node running. This process is long-lived and should remain open in it's own terminal tab.

2. Next, you will need to deploy the smart contracts to the local Ethereum network.

```sh
npm run hardhat:deploy
```

And finally, you can run the local demos:

```sh
npm run dev
```

This will start your server at [http://localhost:3000](http://localhost:3000)

### Manually running services

Each packages in the `./packages` folder has instructions on how to get started
independently of other packages. To run a service on it's own, follow the instructions
in the package's `README.md` file.

**NOTE** It is recommended that you run `npm run clean` before manually running a service.

## Developing

To run type-checking, linting, and tests, simply run:

```
npm run check
```

### Testing

Run tests by running

```
npm run test
```

**NOTE** Be sure to have built the `verite` package by running `npm run build:verite`.

### Linting the codebase

```
npm run lint
```

or, with autofix:

```
npm run lint --fix
```

### Fixing with Prettier

This app uses [Prettier](https://prettier.io) to format the code, and you can auto-format all files with

```
npm run format
```

## Contributors

- [Kim Hamilton Duffy](https://github.com/kimdhamilton) ([Centre Consortium](https://centre.io))
- [Sean Neville](https://github.com/psnevio) ([Xdotzero](http://xdotzero.com))
- [Brice Stacey](https://github.com/bricestacey) ([M2 Labs](https://m2.xyz))
- [Matt Venables](https://github.com/venables) ([M2 Labs](https://m2.xyz))
- [Justin Hunter](https://github.com/polluterofminds) ([polluterofminds](https://polluterofminds.com))
