# Verity Smart Contract Example

This recipe illustrates how to register a web app's or dApp's verification with a remote smart contract. This approach shows a solidity token contract called "Token" that extends the VerifiedCallable contract to support verifications from trusted verifiers. Trusted verifiers sign their verification results with a noted eth key in order to enable the contract to verify the verification results.

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

The Ropsten contract creator is `0x695f7BC02730E0702bf9c8C102C254F595B24161`.
The Ropsten contract address is `0x9f876eadf17dc89e09bab0836a4046070ec0d20e`.

## Adding ETH to the faucet

The faucet requires ETH to transfer the funds to start the demos.

The hardhat tasks, e.g. deploying, are performed using the first account. Each network has its own list of accounts, which can be configured in the file `hardhat.config.ts`.

When using the hardhat network, there are 20 built-in accounts each with 1000 ETH. We have never had the need to add funds in hardhat.

Assuming you have configured a Ropsten network, you will need to fund the account you configured. There are several Ropsten faucets available:

- https://faucet.dimensions.network/
- https://faucet.ropsten.be/
- https://faucet.egorfine.com/

A few ETH is generally enough.

The hardhat faucet task, e.g. running `npx hardhat faucet <address>` sends 1 ETH and 100 VUSDC.

The demo-site faucet (both the dapp and the CeFi demos) sends 0.1 ETH and 100 VUSDC.

Since the full, fixed supply is issued to the contract creator, we used that same account as our faucet. The address is `0x695f7BC02730E0702bf9c8C102C254F595B24161`.
