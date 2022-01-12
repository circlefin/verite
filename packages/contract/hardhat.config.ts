import { task } from "hardhat/config"
import "@nomiclabs/hardhat-waffle"
import * as fs from "fs"
import dotenv from "dotenv"
import { Contract, ContractFactory } from "ethers"
dotenv.config()

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()
  for (const account of accounts) {
    console.log(account.address)
  }
})

task("faucet", "Sends 1 ETH to an address")
  .addPositionalParam("receiver", "The address that will receive them")
  .setAction(async (taskArgs, hre) => {
    if (hre.network.name === "hardhat") {
      console.warn(
        "You are running the faucet task with Hardhat network, which " +
          "is automatically created and destroyed every time. Use the Hardhat" +
          " option '--network localhost'"
      )
    }

    const [sender] = await hre.ethers.getSigners()
    const receiver = taskArgs.receiver

    const tx = await sender.sendTransaction({
      to: receiver,
      value: hre.ethers.constants.WeiPerEther
    })
    await tx.wait()
    console.log(`Transferred 1 ETH to ${receiver}`)
  })

/**
 * Registry Tasks
 *
 * These tasks can be used to interact with the contract state.
 * Each task maps with the methods found on the IVerificationRegistry.sol
 * interface. Please see that file for up-to-date comments and implementation
 * notes.
 */

// Verifier Management Logic
task("registryAddVerifier", "Add a Verifier to the contract")
  .addParam("address", "Address of the verifier")
  .addParam("name", "Name of the Verifier")
  .addParam("did", "did of the verifier")
  .addParam("url", "URL of the verifier")
  .addParam("registry", "Address of the registry")
  .setAction(async (taskArgs, hre) => {
    const registryFactory: ContractFactory =
      await hre.ethers.getContractFactory("VerificationRegistry")
    const registry = registryFactory.attach(taskArgs.registry)

    const info = {
      name: hre.ethers.utils.formatBytes32String(taskArgs.name),
      did: taskArgs.did,
      url: taskArgs.url,
      signer: taskArgs.address
    }
    const tx = await registry.addVerifier(taskArgs.address, info)
    await tx.wait()
    console.log(`Added ${taskArgs.address} as a verifier`)
  })

task("registryUpdateVerifier", "Update information about a Verifier")
  .addParam("address", "Address of the verifier")
  .addParam("name", "Name of the Verifier")
  .addParam("did", "did of the verifier")
  .addParam("url", "URL of the verifier")
  .addParam("registry", "Address of the registry")
  .setAction(async (taskArgs, hre) => {
    const registryFactory: ContractFactory =
      await hre.ethers.getContractFactory("VerificationRegistry")
    const registry = registryFactory.attach(taskArgs.registry)

    const info = {
      name: hre.ethers.utils.formatBytes32String(taskArgs.name),
      did: taskArgs.did,
      url: taskArgs.url,
      signer: taskArgs.address
    }
    const tx = await registry.updateVerifier(taskArgs.address, info)
    await tx.wait()
    console.log(`Updated Verifier information for ${taskArgs.address}`)
  })

task("registryRemoveVerifier", "Remove a Verifier from the registry")
  .addParam("address", "Address of the verifier")
  .addParam("registry", "Address of the registry")
  .setAction(async (taskArgs, hre) => {
    const registryFactory: ContractFactory =
      await hre.ethers.getContractFactory("VerificationRegistry")
    const registry = registryFactory.attach(taskArgs.registry)
    const tx = await registry.removeVerifier(taskArgs.address)
    await tx.wait()
    console.log(`Removed verifier: ${taskArgs.address}`)
  })

task("registryIsVerifier", "Shows whether the address is a verifier")
  .addParam("address", "Address of the verifier")
  .addParam("registry", "Address of the registry")
  .setAction(async (taskArgs, hre) => {
    const registryFactory: ContractFactory =
      await hre.ethers.getContractFactory("VerificationRegistry")
    const registry = registryFactory.attach(taskArgs.registry)
    const isVerifier = await registry.isVerifier(taskArgs.address)
    console.log(`Is ${taskArgs.address} a verifier? ${isVerifier}`)
  })

task("registryGetVerifierCount", "Prints the number of verifiers")
  .addParam("registry", "Address of the registry")
  .setAction(async (taskArgs, hre) => {
    const registryFactory: ContractFactory =
      await hre.ethers.getContractFactory("VerificationRegistry")
    const registry = registryFactory.attach(taskArgs.registry)
    const verifierCount = await registry.getVerifierCount()
    console.log(`Number of verifiers: ${verifierCount}`)
  })

task("registryGetVerifier", "Prints information about a verifier")
  .addParam("address", "Address of the verifier")
  .addParam("registry", "Address of the registry")
  .setAction(async (taskArgs, hre) => {
    const registryFactory: ContractFactory =
      await hre.ethers.getContractFactory("VerificationRegistry")
    const registry = registryFactory.attach(taskArgs.registry)
    const info = await registry.getVerifier(taskArgs.address)
    console.log(`Verifier Information:\n${info}`)
  })

// Verification Logic
task(
  "registryGetVerificationCount",
  "Prints the total number of registered Verification Records"
)
  .addParam("registry", "Address of the registry")
  .setAction(async (taskArgs, hre) => {
    const registryFactory: ContractFactory =
      await hre.ethers.getContractFactory("VerificationRegistry")
    const registry = registryFactory.attach(taskArgs.registry)
    const count = await registry.getVerificationCount()
    console.log(`Verification Count: ${count}`)
  })

task("registryIsVerified", "Shows whether the address is verified")
  .addParam("address", "Subject address")
  .addParam("registry", "Address of the registry")
  .setAction(async (taskArgs, hre) => {
    const registryFactory: ContractFactory =
      await hre.ethers.getContractFactory("VerificationRegistry")
    const registry = registryFactory.attach(taskArgs.registry)
    const value = await registry.isVerified(taskArgs.address)
    console.log(`Is ${taskArgs.address} verified? ${value}`)
  })

task(
  "registryGetVerification",
  "Retrieve a specific Verification Record by UUID"
)
  .addParam("uuid", "UUID")
  .addParam("registry", "Address of the registry")
  .setAction(async (taskArgs, hre) => {
    const registryFactory: ContractFactory =
      await hre.ethers.getContractFactory("VerificationRegistry")
    const registry = registryFactory.attach(taskArgs.registry)
    const value = await registry.getVerification(taskArgs.uuid)
    console.log(`Verification ${taskArgs.uuid}:\n${value}`)
  })

task(
  "registryGetVerificationsForSubject",
  "Retrieve all of the verification records associated with the subject"
)
  .addParam("subject", "Address of the subject")
  .addParam("registry", "Address of the registry")
  .setAction(async (taskArgs, hre) => {
    const registryFactory: ContractFactory =
      await hre.ethers.getContractFactory("VerificationRegistry")
    const registry = registryFactory.attach(taskArgs.registry)
    const value = await registry.getVerificationsForSubject(taskArgs.subject)
    console.log(`Verifications for ${taskArgs.subject}:\n${value.join("\n")}`)
  })

task(
  "registryGetVerificationsForVerifier",
  "Retrieve all of the verification records associated with the verifier"
)
  .addParam("verifier", "Address of the verifier")
  .addParam("registry", "Address of the registry")
  .setAction(async (taskArgs, hre) => {
    const registryFactory: ContractFactory =
      await hre.ethers.getContractFactory("VerificationRegistry")
    const registry = registryFactory.attach(taskArgs.registry)
    const value = await registry.getVerificationsForVerifier(taskArgs.verifier)
    console.log(`Verifications from ${taskArgs.verifier}:\n${value.join("\n")}`)
  })

task(
  "registryRevokeVerification",
  "Revoke a Verification Record that was previously created"
)
  .addParam("uuid", "UUID of the verification record")
  .addParam("registry", "Address of the registry")
  .setAction(async (taskArgs, hre) => {
    const registryFactory: ContractFactory =
      await hre.ethers.getContractFactory("VerificationRegistry")
    const registry = registryFactory.attach(taskArgs.registry)
    const tx = await registry.revokeVerification(taskArgs.uuid)
    await tx.wait()
    console.log(`Revoked verification with UUID: ${taskArgs.uuid}`)
  })

task(
  "registryRemoveVerification",
  "Remove a Verification Record from future blocks"
)
  .addParam("uuid", "UUID of the verification record")
  .addParam("registry", "Address of the registry")
  .setAction(async (taskArgs, hre) => {
    const registryFactory: ContractFactory =
      await hre.ethers.getContractFactory("VerificationRegistry")
    const registry = registryFactory.attach(taskArgs.registry)
    const tx = await registry.removeVerification(taskArgs.uuid)
    await tx.wait()
    console.log(`Revoked verification with UUID: ${taskArgs.uuid}`)
  })

task(
  "registryRegisterVerification",
  "Register a Verification Record for the given address"
)
  .addParam("address", "Subject address to be verified")
  .addParam("registry", "Address of the registry")
  .setAction(async (taskArgs, hre) => {
    const registryFactory: ContractFactory =
      await hre.ethers.getContractFactory("VerificationRegistry")
    const registry = registryFactory.attach(taskArgs.registry)

    const domain = {
      name: "VerificationRegistry",
      version: "1.0",
      chainId: 1337,
      verifyingContract: registry.address
    }

    const types = {
      VerificationResult: [
        { name: "schema", type: "string" },
        { name: "subject", type: "address" },
        { name: "expiration", type: "uint256" },
        { name: "payload", type: "bytes32" }
      ]
    }

    const verificationResult = {
      schema: "centre.io/credentials/kyc",
      subject: taskArgs.address,
      expiration: Math.floor(Date.now() / 1000) + 60, // 1 minute
      payload: hre.ethers.utils.formatBytes32String("example")
    }

    // We'll use Account #0 since it is used for deployment
    const [deployer] = await hre.ethers.getSigners()

    const signature = await deployer._signTypedData(
      domain,
      types,
      verificationResult
    )

    const tx = await registry.registerVerification(
      verificationResult,
      signature
    )
    await tx.wait()
    console.log(
      `Registered Verification for address: ${
        taskArgs.address
      }, by verifier ${await deployer.getAddress()}`
    )
  })

/**
 * @type import('hardhat/config').HardhatUserConfig
 * The chainId here is a workaround for MetaMask, which assumes chainId 1337 while hardhat uses 31337
 */

export default {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      chainId: 1337
    },
    rinkeby: {
      chainId: 4,
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts:
        // quick hack to get around changeme being an invalid private key
        process.env.ROPSTEN_PRIVATE_KEY !== "changeme"
          ? [process.env.ROPSTEN_PRIVATE_KEY]
          : []
    },
    ropsten: {
      chainId: 3,
      url: `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts:
        // quick hack to get around changeme being an invalid private key
        process.env.ROPSTEN_PRIVATE_KEY !== "changeme"
          ? [process.env.ROPSTEN_PRIVATE_KEY]
          : []
    }
  }
}
