# Verity Smart Contract Examples

These recipes illustrate how smart contracts use results of Verifiable Credential verifications even when the contracts are not technically or economically capable of executing the verifications themselves.

These contracts follow a pattern in which verifications are performed off-chain and then confirmed on-chain. An off-chain verifier handles verifiable credential exchange in the usual manner, and upon successful verification, creates a minimal verification result object.

The verifier then hashes and signs the verification result, enabling subsequent validation within smart contracts. The verifier either registers the result directly with a Verification Registry contract as part of the verification process (the "verifier submission" pattern), or returns it to subjects for use in smart contract transactions (the "subject submission" pattern).

Read more about Verifier and Subject Submission patterns in TODO LINK.

## Contract Description

**VerificationRegistry**: Demonstrates a persistent verification registry, supporting management of verifiers and verification results as follows:

- The contract owner is able to manage (register/remove) verifiers
- Rgistered verifiers may manage verification results they've created and signed.
- Subject may manage verification result they've received from a registered verifier (through an internal function; this is demonstrated in `ThresholdToken`)

`VerificationRegistry` converts a valid, authentic verification result to a data-minimized verification record before persisting.

**PermissionedToken**: This token uses `VerificationRegistry` by delegation to support KYC verifications. The `beforeTokenTransfer` hook, which executes as part of the OpenZeppelin ERC20 transfer implementation, ensures that the sender and recipient are verified counterparties. This contract demonstrates the verifier submission pattern; only registered verifiers may populate the registry.

**ThresholdToken**: Demonstrates a token requiring sender verification for transfers over a pre-defined threshold.
This contract demonstrates the subject submission pattern: `ThresholdToken` extends `VerificationRegistry` to support subject submission of verification results via the custom function `validateAndTransfer` (which in turn calls an internal `VerificationRegistry` function). The `beforeTokenTransfer` hook emits an error if a valid verification record isn't present for the sending address in the `VerificationRegistry`. Note: in the Dapp demo, this is what cases the Dapp to initiate a credential request from the holder/subject.

## Getting Started

This package is set up as an [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces) (requires npm v7 or greater), and as such, the dependencies for all included packages are installed from the root level using `npm install`. Do not run `npm install` from this directory.

This app leverages hardhat for local development and react for the dApp.

Run a standalone node in a separate terminal:

```
npx hardhat node
```

Run a standalone hardhat node as noted above. Then deploy the contract:

```
npx hardhat run scripts/deploy.ts --network localhost
```

Make sure you have MetaMask installed in Chrome.

The web app will guide you through use of the faucet and verify hardhat tasks, which give your MetaMask account tokens and enable simulation of successful verification. The frontend was created with create-react-app with typescript and npm toggled, and subsequently modified to use next.js.

## Testing

Run the tests, which also compile and deploy the contract:

```
npx hardhat test --network localhost
```

## Troubleshooting

When restarting the app locally with a new freshly-run hardhat node, MetaMask can get confused and use the wrong nonce, one based on the previous hardhat run. Enable 'Customize transaction nonce' in MetaMask Settings->Advanced to set the nonce manually to work around this issue. Reset the custom nonce in MetaMask's to '0' when transacting on the first run, and increment it manually from there. Alternatively, you can go to Settings > Advanced and click "Reset Account".

## Deploying to Ropsten Network

The file `hardhat.config.ts` defines a list of supported networks. For demo purposes, we deployed the contract to the Ropsten network. The current configuration uses Alchemy as a network provider. When the contract is deployed, the full, fixed supply of VUSDC are credited to the account that deployed the contract. You can set your Alchemy API key and your Ropsten account's private key in `.env`.

Each contract is deployed from the address `0x695f7BC02730E0702bf9c8C102C254F595B24161`.

- PermissionedToken contract address: `0xD5EeF0d9489f8a2FcAF325893FB04cA460566865`.
- VerificationRegistry contract address: `0xF15791f60782cFD5c4677642463920B3501F10Bf`
- ThresholdToken contract address is `0x9f876eadf17dc89e09bab0836a4046070ec0d20e`.

Each

## Adding ETH to the faucet

The faucet requires ETH to transfer the funds to start the demos.

The hardhat tasks, e.g. deploying, are performed using the first account. Each network has its own list of accounts, which can be configured in the file `hardhat.config.ts`.

When using the hardhat network, there are 20 built-in accounts each with 1000 ETH. We have never had the need to add funds in hardhat.

Assuming you have configured a Ropsten network, you will need to fund the account you configured. There are several Ropsten faucets available:

- <https://faucet.dimensions.network/>
- <https://faucet.ropsten.be/>
- <https://faucet.egorfine.com/>

A few ETH is generally enough.

The hardhat faucet task, e.g. running `npx hardhat faucet <address>` sends 1 ETH and 100 VUSDC.

The demos faucet (both the dapp and the CeFi demos) sends 0.1 ETH and 100 VUSDC.

Since the full, fixed supply is issued to the contract creator, we used that same account as our faucet. The address is `0x695f7BC02730E0702bf9c8C102C254F595B24161`.

## Contributors

- [Kim Hamilton Duffy](https://github.com/kimdhamilton) ([Centre Consortium](https://centre.io))
- [Sean Neville](https://github.com/psnevio) ([Xdotzero](http://xdotzero.com))
- [Brice Stacey](https://github.com/bricestacey) ([M2 Labs](https://m2.xyz))
- [Matt Venables](https://github.com/venables) ([M2 Labs](https://m2.xyz))
