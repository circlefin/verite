# Verite Smart Contract Examples

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

## Deploying to Goerli Test Network

The file `hardhat.config.ts` defines a list of supported networks. For demo purposes, we deployed the contract to the Goerli network. The current configuration uses Ankr as a free RPC network provider. When the contracts are deployed, the full, fixed supply of tokens are credited to the account that deployed the contract. You can set your Goerli account's private key in `.env`.

Each contract is deployed from the address `0x695f7BC02730E0702bf9c8C102C254F595B24161`.

- PermissionedToken contract address: `0x41eC80139E889d74A16261e569857BaC2D400e5F`.
- VerificationRegistry contract address: `0xF916ba3c52a3C1015Da0D2CBfE62F00F4C3EcAc9`
- ThresholdToken contract address is `0xfae60eA8F5bE08C363B4cadF38a97Fd75B895679`.

### Update Secrets

Update the file `/packages/contract/.env` with your Ethereum secret key and Alchemy API key. The Ethereum secret key will be used to deploy the contract. You should be sure the wallet has sufficient funds to deploy the contract ahead of time.

When deployed, the Threshold and Permissioned tokens mint their total supply to the contract deployer. The dapp uses this same wallet as the faucet. You can find the secret key used in the environment variable named `ETH_FAUCET_PRIVATE_KEY`

You can use any Alchemy API key for the deploy, however you can find the one we use in the environment variable named `ALCHEMY_API_KEY`

### Deploy Contract

```sh
[verite/packages/contract] npx hardhat run --network goerli scripts/deploy.ts
Deploying the contracts with the account: 0x695f7BC02730E0702bf9c8C102C254F595B24161
Account balance: 640802894464673618
Registry address: 0xF916ba3c52a3C1015Da0D2CBfE62F00F4C3EcAc9
Permissioned Token Address: 0x41eC80139E889d74A16261e569857BaC2D400e5F
Threshold Token address: 0xfae60eA8F5bE08C363B4cadF38a97Fd75B895679
Added trusted verifier: 0x695f7BC02730E0702bf9c8C102C254F595B24161
Added trusted verifier: 0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1
Registered Verification for address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, by verifier: 0x695f7BC02730E0702bf9c8C102C254F595B24161
Registered Verification for address: 0x695f7BC02730E0702bf9c8C102C254F595B24161, by verifier: 0x695f7BC02730E0702bf9c8C102C254F595B24161
Registered Verification for address: 0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1, by verifier: 0x695f7BC02730E0702bf9c8C102C254F595B24161
Registered Verification for address: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8, by verifier: 0x695f7BC02730E0702bf9c8C102C254F595B24161
Registered Verification for address: 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc, by verifier: 0x695f7BC02730E0702bf9c8C102C254F595B24161
Registered Verification for address: 0x90f79bf6eb2c4f870365e785982e1f101e93b906, by verifier: 0x695f7BC02730E0702bf9c8C102C254F595B24161
```

### Contract Artifacts

The Dapp reads contract artifacts, including the ABI and contract addresses from the `/packages/e2e-demo/contracts` directory. This folder is gitignored for developer convenience, as it changes often, after each contract deploy. For production builds, the files found in `/packages/e2e-demo/bin/fixtures` are copied over. If you change the ABI, you’ll need to update those files. After each contract deploy, you’ll need to update the contract addresses using the output from the contract deploy script. Then re-deploy the dapp so it has the latest values. You will also want to update the contract package’s README to track the latest contract changes.

### Redeploy the Dapp

With the updated contract artifacts, the e2e-demo site must be redeployed.

### Seed the verifier and faucet accounts with funds

Be sure the following accounts have ETH:

- `0x695f7BC02730E0702bf9c8C102C254F595B24161`
- `0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1`

You can check the addresses using [https://goerli.etherscan.io/](https://goerli.etherscan.io/)

## Adding ETH to the faucet

The faucet requires ETH to transfer the funds to start the demos.

The hardhat tasks, e.g. deploying, are performed using the first account. Each network has its own list of accounts, which can be configured in the file `hardhat.config.ts`.

When using the hardhat network, there are 20 built-in accounts each with 1000 ETH. We have never had the need to add funds in hardhat.

Assuming you have configured a Goerli network, you will need to fund the account you configured. There are several Goerli faucets available:

- <https://goerlifaucet.com/>
- <https://goerli-faucet.slock.it/>

A few ETH is generally enough.

The hardhat faucet task, e.g. running `npx hardhat faucet <address>` sends 1 ETH and 100 VUSDC.

The demos faucet (both the dapp and the CeFi demos) sends 0.1 ETH and 100 VUSDC.

Since the full, fixed supply is issued to the contract creator, we used that same account as our faucet. The address is `0x695f7BC02730E0702bf9c8C102C254F595B24161`.

## Contributors

- [Kim Hamilton Duffy](https://github.com/kimdhamilton) ([Centre Consortium](https://centre.io))
- [Sean Neville](https://github.com/psnevio) ([Xdotzero](http://xdotzero.com))
- [Brice Stacey](https://github.com/bricestacey) ([M2 Labs](https://m2.xyz))
- [Matt Venables](https://github.com/venables) ([M2 Labs](https://m2.xyz))
