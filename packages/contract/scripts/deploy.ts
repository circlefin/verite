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

  // deploy VerificationRegistry
  const registryFactory: ContractFactory = await hre.ethers.getContractFactory(
    "VerificationRegistry"
  )
  const registryContract: Contract = await registryFactory.deploy()
  await registryContract.deployed()
  console.log("Registry address:", registryContract.address)

  // deploy PermissionedToken
  const pTokenFactory: ContractFactory = await hre.ethers.getContractFactory(
    "PermissionedToken"
  )
  const permissionedToken: Contract = await pTokenFactory.deploy(
    "Permissioned Token",
    "PUSD",
    "100000000000"
  )
  await permissionedToken.deployed()
  console.log("Permissioned Token Address:", permissionedToken.address)

  // set the registry on the permissioned token
  const setRegistryTx = await permissionedToken.setVerificationRegistry(
    registryContract.address
  )
  setRegistryTx.wait()

  // deploy ThresholdToken
  const tTokenFactory: ContractFactory = await hre.ethers.getContractFactory(
    "ThresholdToken"
  )
  const thresholdToken: Contract = await tTokenFactory.deploy("100000000000")
  await thresholdToken.deployed()
  console.log("Threshold Token address:", thresholdToken.address)

  // set up a trusted verifier for demo purposes
  await createTrustedVerifier(registryContract, thresholdToken)

  // save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(registryContract, permissionedToken, thresholdToken)
}

async function createTrustedVerifier(
  verificationRegistry: Contract,
  thresholdToken: Contract
) {
  const mnemonic =
    "announce room limb pattern dry unit scale effort smooth jazz weasel alcohol"
  const signer: Wallet = hre.ethers.Wallet.fromMnemonic(mnemonic)

  const testVerifierInfo = {
    name: hre.ethers.utils.formatBytes32String("Centre Consortium"),
    did: "did:web:centre.io",
    url: "https://centre.io/about",
    signer: signer.address
  }

  const setThresholdVerifierTx = await thresholdToken.addVerifier(
    signer.address,
    testVerifierInfo
  )
  await setThresholdVerifierTx.wait()

  const setRegistryVerifierTx = await verificationRegistry.addVerifier(
    signer.address,
    testVerifierInfo
  )
  await setRegistryVerifierTx.wait()

  console.log("Added trusted verifier:", signer.address)
}

function saveFrontendFiles(
  registryContract,
  permissionedToken,
  thresholdToken
) {
  const fs = require("fs")
  const contractsDir = __dirname + "/../../demo-site/contracts"

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir)
  }

  fs.writeFileSync(
    contractsDir + "/registry-contract-address.json",
    JSON.stringify({ RegistryContract: registryContract.address }, undefined, 2)
  )
  const registryContractArtifact = hre.artifacts.readArtifactSync(
    "VerificationRegistry"
  )
  fs.writeFileSync(
    contractsDir + "/RegistVerificationRegistryContract.json",
    JSON.stringify(registryContractArtifact, null, 2)
  )

  fs.writeFileSync(
    contractsDir + "/permissioned-token-address.json",
    JSON.stringify(
      { PermissionedToken: permissionedToken.address },
      undefined,
      2
    )
  )
  const permissionedTokenArtifact =
    hre.artifacts.readArtifactSync("PermissionedToken")
  fs.writeFileSync(
    contractsDir + "/PermissionedToken.json",
    JSON.stringify(permissionedTokenArtifact, null, 2)
  )

  fs.writeFileSync(
    contractsDir + "/threshold-token-address.json",
    JSON.stringify({ ThresholdToken: thresholdToken.address }, undefined, 2)
  )
  const thresholdTokenArtifact =
    hre.artifacts.readArtifactSync("ThresholdToken")
  fs.writeFileSync(
    contractsDir + "/ThresholdToken.json",
    JSON.stringify(thresholdTokenArtifact, null, 2)
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
