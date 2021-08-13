import { task } from "hardhat/config"
import "@nomiclabs/hardhat-waffle"
import * as fs from "fs"

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

task("faucet", "Sends ETH and tokens to an address")
  .addPositionalParam("receiver", "The address that will receive them")
  .setAction(async (taskArgs, hre) => {
    if (hre.network.name === "hardhat") {
      console.warn(
        "You are running the faucet task with Hardhat network, which " +
          "is automatically created and destroyed every time. Use the Hardhat" +
          " option '--network localhost'"
      )
    }

    const addressesFile =
      __dirname + "/../demo-site/contracts/contract-address.json"

    if (!fs.existsSync(addressesFile)) {
      console.error("You need to deploy your contract first")
      return
    }

    const addressJson = fs.readFileSync(addressesFile)
    const address = JSON.parse(addressJson.toString())

    if ((await hre.ethers.provider.getCode(address.Token)) === "0x") {
      console.error("You need to deploy your contract first")
      return
    }

    const token = await hre.ethers.getContractAt("Token", address.Token)
    const [sender] = await hre.ethers.getSigners()
    const receiver = taskArgs.receiver

    // set ourselves as a verifier
    const signer = hre.ethers.Wallet.createRandom()
    await token.addTrustedVerifier(
      signer.address,
      hre.ethers.utils.formatBytes32String("did:web:verity.id")
    )

    const expiration = Date.now() + 600

    const domain: object = {
      name: "VerificationValidator",
      version: "1.0",
      chainId: 1337,
      verifyingContract: token.address
    }

    const types: Record<string, any[]> = {
      KYCVerificationInfo: [
        { name: "message", type: "string" },
        { name: "expiration", type: "uint256" },
        { name: "subjectAddress", type: "address" }
      ]
    }

    const verificationInfo: object = {
      message: "",
      expiration: expiration,
      subjectAddress: sender.address
    }

    const signature = await signer._signTypedData(
      domain,
      types,
      verificationInfo
    )

    const tx = await token.validateAndTransfer(
      receiver,
      100,
      verificationInfo,
      signature
    )
    await tx.wait()

    const tx2 = await sender.sendTransaction({
      to: receiver,
      value: hre.ethers.constants.WeiPerEther
    })
    await tx2.wait()

    console.log(`Transferred 1 ETH and 100 tokens to ${receiver}`)
  })

task("add-verifier", "Adds a trusted verifier to the contract")
  .addPositionalParam("signerAddress", "The verifier's signining address")
  .addPositionalParam("signerDID", "The verifier's identifier")
  .setAction(async (taskArgs, hre) => {
    if (hre.network.name === "hardhat") {
      console.warn(
        "You are running the verify task with Hardhat network, which " +
          "is automatically created and destroyed every time. Use the Hardhat" +
          " option '--network localhost'"
      )
    }

    const addressesFile =
      __dirname + "/../demo-site/contracts/contract-address.json"

    if (!fs.existsSync(addressesFile)) {
      console.error("You need to deploy your contract first")
      return
    }

    const addressJson = fs.readFileSync(addressesFile)
    const address = JSON.parse(addressJson.toString())

    if ((await hre.ethers.provider.getCode(address.Token)) === "0x") {
      console.error("You need to deploy your contract first")
      return
    }

    const token = await hre.ethers.getContractAt("Token", address.Token)
    const [sender] = await hre.ethers.getSigners()
    const signerAddress = hre.ethers.utils.getAddress(taskArgs.signerAddress)
    const signerDID = taskArgs.signerDID

    const signer = hre.ethers.Wallet.createRandom()
    const txReceipt = await token.addTrustedVerifier(
      signerAddress,
      hre.ethers.utils.formatBytes32String(signerDID)
    )
    await txReceipt.wait() // wait until the tx is mined

    console.log(`Added trusted verifier ${signerAddress} => ${signerDID}`)
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
    }
  }
}
