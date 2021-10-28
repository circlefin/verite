import { task } from "hardhat/config"
import "@nomiclabs/hardhat-waffle"
import * as fs from "fs"
import dotenv from "dotenv"
dotenv.config()

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()
  for (const account of accounts) {
    console.log(account.address)
  }
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
