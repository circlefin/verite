# Verity Smart Contract Example

This recipe illustrates how to register a web app's or dApp's verification with a remote smart contract. This approach shows a solidity token contract called "Token" that extends the VerifiedCallable contract to support verifications from trusted verifiers. Trusted verifiers sign their verification results with a noted eth key in order to enable the contract to verify the verification results.

## Getting Started

This app leverages hardhat for local development and react for the dApp.

From the repository's root directory:

```
npm install
```

From this package's root directory:

Run a standalone node in a separate terminal:

```
npx hardhat node
```

Run the tests, which also compile and deploy the contract:

```
npx hardhat test --network localhost
```

## Running the web app

Run a standalone hardhat node as noted above. Then deploy the contract:

```
npx hardhat run scripts/deploy.ts --network localhost
```

Make sure you have MetaMask installed in Chrome.

The web app will guide you through use of the faucet and verify hardhat tasks, which give your MetaMask account tokens and enable simulation of successful verification. The frontend was created with create-react-app with typescript and npm toggled, and subsequently modified to use next.js

## Troubleshooting

When restarting the app locally with a new freshly-run hardhat node, MetaMask can get confused and use the wrong nonce, one based on the previous hardhat run. Enable 'Customize transaction nonce' in MetaMask Settings->Advanced to set the nonce manually to work around this issue. Reset the custom nonce in MetaMask's to '0' when transacting on the first run, and increment it manually from there.
