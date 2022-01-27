# Solana Example

This package illustrate how programs use results of Verifiable Credential verifications even when the contracts are not technically or economically capable of executing the verifications themselves.

This program follows a pattern in which verifications are performed off-chain and then confirmed on-chain. An off-chain verifier handles verifiable credential exchange in the usual manner, and upon successful verification, creates a minimal verification result object.

The verifier either registers the result directly with a Verification Registry program as part of the verification process (the "verifier submission" pattern), or returns it to subjects for use in smart contract transactions (the "subject submission" pattern).

This specific exampledemonstrates the minimally viable process of verifying the result.

Read more about Verifier and Subject Submission patterns in TODO LINK.

## Getting Started

This package is set up as an [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces) (requires npm v7 or greater), and as such, the dependencies for all included packages are installed from the root level using `npm install`. Do not run `npm install` from this directory.

From the root of the monorepo, run:

```sh
npm install
```

Additionally, you must install rust, solana, and anchor. You can find [instructions at the Anchor website](https://project-serum.github.io/anchor/getting-started/installation.html).

## Testing

```
npm run test
```
