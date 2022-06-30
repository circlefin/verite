import { Wallet } from "@ethersproject/wallet"
import { ethers } from "ethers"

import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import { getProvider } from "../../../../lib/eth-fns"

type Response = {
  status: string
}

/**
 * Simple ETH faucet so Verifiers can have gas to register verifications.
 */
export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "POST")

  // Send ETH to this address
  const address = req.body.address

  // Provider
  const provider = getProvider()

  // Signer will be the account sending the funds
  const signer = new Wallet(process.env.ETH_FAUCET_PRIVATE_KEY, provider)

  // Send funds
  const tx = await signer.sendTransaction({
    to: address,
    value: ethers.constants.WeiPerEther.div(100)
  })

  // Wait for transaction to be mined
  await tx.wait()

  console.log(`Transferred 0.1 ETH to ${address}`)

  res.status(200).json({ status: "ok" })
})
