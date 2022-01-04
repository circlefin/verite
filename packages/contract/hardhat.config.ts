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

/**
 * Registry Tasks
 *
 * These tasks can be used to read the contract state
 */

// Verifier Management Logic
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
 * @type import('hardhat/config').HardhatUserConfig
 * The chainId here is a workaround for MetaMask, which assumes chainId 1337 while hardhat uses 31337
 */

export default {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      chainId: 1337
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
