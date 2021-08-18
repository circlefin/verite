import { verificationResult } from "@centre/verity"
import { Wallet } from "@ethersproject/wallet"
import { ethers, Contract } from "ethers"
import { apiHandler, requireMethod } from "../../../lib/api-fns"
import {
  verityTokenContractAddress,
  verityTokenContractArtifact
} from "../../../lib/eth-fns"

type Response = {
  status: string
}

export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "POST")

  const address = req.body.address

  const network = ethers.providers.getNetwork(
    process.env.NEXT_PUBLIC_ETH_NETWORK
  )
  const provider = ethers.providers.getDefaultProvider(network, {
    alchemy: process.env.ALCHEMY_API_KEY
  })

  const signer = new Wallet(process.env.ETH_FAUCET_PRIVATE_KEY, provider)

  // In a production environment, one would need to call out to a verifier to get a result
  const mnemonic =
    "announce room limb pattern dry unit scale effort smooth jazz weasel alcohol"
  const verification = await verificationResult(
    signer.address,
    verityTokenContractAddress(),
    mnemonic
  )

  // Load the contract
  const contract = new Contract(
    verityTokenContractAddress(),
    verityTokenContractArtifact().abi,
    signer
  )

  // Verify
  const tx = await contract.validateAndTransfer(
    address,
    100,
    verification.verificationInfo,
    verification.signature
  )
  await tx.wait()

  // Send
  const tx2 = await signer.sendTransaction({
    to: address,
    value: ethers.constants.WeiPerEther.div(10)
  })
  await tx2.wait()

  console.log(`Transferred 0.1 ETH and 100 tokens to ${address}`)

  res.status(200).json({ status: "ok" })
})
