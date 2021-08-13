// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { Contract, ContractFactory, Wallet } from "ethers"
import * as hre from "hardhat"

async function main() {
  if (hre.network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    )
  }

  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [deployer] = await hre.ethers.getSigners()
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  )

  console.log("Account balance:", (await deployer.getBalance()).toString())

  const TokenFactory: ContractFactory = await hre.ethers.getContractFactory(
    "Token"
  )
  const token: Contract = await TokenFactory.deploy()
  await token.deployed()

  console.log("Token address:", token.address)

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(token)

  // We also set up a trusted verifier for demo purposes
  await createTrustedVerifier(token)
}

async function createTrustedVerifier(token: Contract) {
  const mnemonic =
    "announce room limb pattern dry unit scale effort smooth jazz weasel alcohol"
  const signer: Wallet = hre.ethers.Wallet.fromMnemonic(mnemonic)
  const setVerifierTx = await token.addTrustedVerifier(
    signer.address,
    hre.ethers.utils.formatBytes32String("did:web:verity.id")
  )
  await setVerifierTx.wait()
  console.log("Added trusted verifier:", signer.address)
}

function saveFrontendFiles(token) {
  const fs = require("fs")
  const contractsDir = __dirname + "/../../demo-site/contracts"

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir)
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ Token: token.address }, undefined, 2)
  )

  const TokenArtifact = hre.artifacts.readArtifactSync("Token")

  fs.writeFileSync(
    contractsDir + "/Token.json",
    JSON.stringify(TokenArtifact, null, 2)
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
