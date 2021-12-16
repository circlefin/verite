import { Wallet } from "@ethersproject/wallet"
import { verificationResult } from "@verity/core"
import { ethers, Contract } from "ethers"
import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import {
  getProvider,
  permissionedTokenContractAddress,
  permissionedTokenContractArtifact,
  registryContractAddress,
  registryContractArtifact
} from "../../../../lib/eth-fns"

type Response = {
  status: string
}

/**
 * The Permissioned Token used in this demo requires that both the sender and
 * the receiver have funds. We will register the address, send funds, and
 * subsequently remove the verification. This will allow for the UX
 * necessary for the demo.
 */
export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "POST")

  // Receiver
  const address = req.body.address

  const provider = getProvider()

  // Generate a VerificationResult
  const subjectAddress = address
  const contractAddress = registryContractAddress()
  const chainId = parseInt(process.env.NEXT_PUBLIC_ETH_NETWORK, 10)
  const privateKey = process.env.VERIFIER_PRIVATE_KEY
  const result = await verificationResult(
    subjectAddress,
    contractAddress,
    privateKey,
    chainId
  )

  // Load Wallet for the verifier.
  const verifier = new Wallet(privateKey, provider)

  // Load Registry Contract with the Verifier as connected provider. This
  // will use the Verifier to register the verifications.
  const registry = new Contract(
    registryContractAddress(),
    registryContractArtifact().abi,
    verifier
  )

  // Register the receiver
  const tx1 = await registry.registerVerification(
    result.verificationResult,
    result.signature
  )
  await tx1.wait()

  // Load Wallet for the faucet
  const faucet = new Wallet(process.env.ETH_FAUCET_PRIVATE_KEY, provider)

  // Load the Token contract with the Faucet as the connected provider. This
  // will use the Faucet to send the tokens
  const tokenContract = new Contract(
    permissionedTokenContractAddress(),
    permissionedTokenContractArtifact().abi,
    faucet
  )

  // Send tokens
  const tx2 = await tokenContract.transfer(address, 100)
  await tx2.wait()

  // Unregister the receiver
  const records = await registry.getVerificationsForSubject(subjectAddress)
  const recordUUID = records[0].uuid
  const tx3 = await registry.removeVerification(recordUUID)
  await tx3.wait()

  // Send ETH
  const tx4 = await faucet.sendTransaction({
    to: address,
    value: ethers.constants.WeiPerEther.div(10)
  })
  await tx4.wait()

  console.log(`Transferred 0.1 ETH and 100 tokens to ${address}`)

  res.status(200).json({ status: "ok" })
})
