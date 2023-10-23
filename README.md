# Verite

Decentralized Identity for Crypto Finance.

This repository is a monorepo containing the Core Verite Javascript SDK, documentation, as well as several demos to illustrate issuance, verification, revocation, and real-world use cases of the Verite standard.

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
- [solana](./packages/solana) - A sample Solana program demonstrating how to implement Verite into a program.
- [e2e-demo](./packages/e2e-demo) - A demo walkthrough of the entire Verite project, showcasing issuance, verification, and revocation, with additional demos for DeFi and custodial use cases.
- [wallet](./packages/wallet) - A demo wallet for storing and submitting credentials. Written in React Native using Expo.

In addition to the packages above, there are 3 single-purpose demo packages, largely extracted
from the `e2e-demo` package to help clarify each major function of Verite credentials.

- [verite/demo-issuer](./packages/demo-issuer) - A simplified demo of issuing Verifiable Credentials using `verite`.
- [verite/demo-verifier](./packages/demo-verifier) - A simplified demo of verifying Verifiable Credentials using `verite`.
- [verite/demo-revocation](./packages/demo-revocation) - A simplified demo of revoking credentials using `verite`.

Each package contains a README file with specific details about how to use the package.

### Development Environment Setup

Setting up a new development environment is accomplished by running the following script:

```sh
npm run setup
```

This script will do the following:

- Install all dependencies
- Build the `verite` project
- Set up the local IP hostname for `e2e-demo` to be used with the wallet.
- Generate an auth JWT secret for `e2e-demo`
- Generate issuer and verifier DIDs and secrets for `e2e-demo`
- Build and migrate the database for `e2e-demo`

## Running the end-to-end Demo

When first starting, you will likely be most interested in the `./packages/e2e-demo` package. This package contains several demos and integrates deeply with `verite`.

This package contains several isolated demos. One of the demos showcases an Ethereum dApp integration, and requires running a local Ethereum node.

### Running a local Ethereum node

Running an Ethereum node is easily accomplished by using our built-in scripts for running a [HardHat](https://hardhat.org) node.

1. To start a local Ethereum node, simply run:

```sh
npm run hardhat:node
```

Now you have a local Ethereum node running. This process is long-lived and should remain open in its own terminal tab.

2. Next, you will need to deploy the smart contracts to the local Ethereum network.

```sh
npm run hardhat:deploy
```

And finally, you can run the local demos:

```sh
npm run dev
```

This will start your server at [http://localhost:3000](http://localhost:3000)

### Running the wallet

To run the wallet, you will need the [Expo Go](https://expo.dev/client) app on your phone.

1. Start the wallet:

   ```sh
   npm run wallet
   ```

2. Scan the QR code with your phone.

On iOS, scan the QR code with your phone's camera.
On Android, scan the QR code from within the Expo Go app.

### Manually running services

Each packages in the `./packages` folder has instructions on how to get started
independently of other packages. To run a service on it's own, follow the instructions
in the package's `README.md` file.

**NOTE** It is recommended that you run `npm run clean` before manually running a service.

## Developing

To run type-checking, linting, and tests, simply run:

```sh
npm run check
```

### Testing

Run tests by running

```sh
npm run test
```

**NOTE** Be sure to have built the `verite` package by running `npm run build:verite`.

### Linting the codebase

```sh
npm run lint
```

or, with autofix:

```sh
npm run lint -- --fix
```

### Run a type check

```sh
npm run type-check --workspaces --if-present
```

### Fixing with Prettier

This app uses [Prettier](https://prettier.io) to format the code, and you can auto-format all files with

```sh
npm run format
```

## Troubleshooting

### Nonce too high

Occasionally, the local hardhat ethereum node and MetaMask become out of sync. If you see an error stating "Nonce too high", you can fix this by:

1. Open MetaMask settings
2. Click "Advanced"
3. Click "Reset Account"

## Contributors

- [Kim Hamilton Duffy](https://github.com/kimdhamilton)
- [Sean Neville](https://github.com/psnevio) ([Xdotzero](http://xdotzero.com))
- [Brice Stacey](https://github.com/bricestacey) ([M2 Labs](https://m2.xyz))
- [Matt Venables](https://github.com/venables) ([M2 Labs](https://m2.xyz))
- [Justin Hunter](https://github.com/polluterofminds) ([polluterofminds](https://polluterofminds.com))
