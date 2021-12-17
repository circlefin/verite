---
sidebar_label: Smart Contract Verifications
sidebar_position: 4
---

# Getting Started With Smart Contract Verifications

As discussed in the [Smart Contract Patterns](../patterns/smart-contract-verity.md) section of the documentation, using smart contracts to manage verification registries provides a trustless and decentralized mechanism for individuals and organizations to look-up verification statuses, verification credentials, revoke credentials, and more.

First, we'll use the example verifier registry contract that Verity has created. [You can find that contract here](https://github.com/centrehq/demo-site/blob/main/packages/contract/contracts/VerificationRegistry.sol). While this contract should be treated as an example and you should create your own as needed by your specifications when deploying to production, it covers the necessary actions that a verification registry would need to take.

## Setting Up Hardhat

Hardhat is a smart contract development tools platform. It provides command-line functionality, the ability to run a local Ethereum test node, and more. We'll create a new project using Hardhat.

**Prerequisites:**

- Node.js >= 12.0
- npm or yarn

Assuming the prerequisites are met, you can create a new Hardhat project by creating a new folder:

`mkdir registry-contract && cd registry-contract`

Now, you'll need to initialize the project and install Hardhat as a development dependency:

```
npm init
npm i -D hardhat
```

Now, it's time to set up an empty Hardhat project. Run the following command:

`npx hardhat`

You'll be prompted to select either a sample project or "Create an empty hardhat.config.js". Select the empty hardhat.config.js option.

Now, you'll want to install some tools to help you work with your smart contract. Run the following:

`npm install --save-dev @nomiclabs/hardhat-ethers ethers @nomiclabs/hardhat-waffle ethereum-waffle chai`

Next, you'll need to update your `hardhat.config.js` file. Add the following line to the top:

```js
require("@nomiclabs/hardhat-waffle")
```

In order to work on the smart contract, you'll need to create a `contracts` folder in the root of the project directory. Once you've done that, you can create a new file called `Registry.sol`. For simplicity, you can copy over the code from the [example Verity registry contract](https://github.com/centrehq/demo-site/blob/main/packages/contract/contracts/VerificationRegistry.sol).

Now, you can compile the contract with Hardhat by running the following command:

`npx hardhat compile`

## Testing And Interacting With The Contract

The best way to explore how to interact with a registry contract is to write tests for it. While tests are not a 100% direct comparison to using the contract in an app, they are very close and it's relatively easy to extract test code and use it in your app.

So, to test the contract, create a folder inside the `contracts` folder called `tests`. Then inside that folder create a file called `RegistryTest.js`.
