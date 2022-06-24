import { Contract } from "@ethersproject/contracts"
import { Wallet } from "@ethersproject/wallet"
import { VerificationResultResponse, verificationResult } from "verite"

import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import { getProvider, registryContractArtifact } from "../../../../lib/eth-fns"

export default apiHandler<VerificationResultResponse>(async (req, res) => {
  requireMethod(req, "POST")

  // the dapp sends its own calling address to the verifier, and though the
  // verifier does not need to confirm ownership of the address, it includes
  // the address in the signed digest so that the contract can confirm it
  // and no other subject can use this signed VerificationInfo
  const subjectAddress = req.body.subjectAddress

  // VerificationInfo objects are encoded, hashed, and signed following EIP-712
  // See https://eips.ethereum.org/EIPS/eip-712
  // Verite's domain separator includes a name, version, chainId, and
  // verifyingContract. Since the demos support contracts across multiple
  // chains and addresses, we'll need to specify them when generating the
  // verification result.
  const registryAddress = req.query.registryAddress as string
  const chainId = parseInt(process.env.NEXT_PUBLIC_ETH_NETWORK, 10)

  // A production verifier would integrate with its own persistent wallet, but
  // this example merely regenerates a new trusted signer when needed.
  // We use the same account here that the deploy script used in order to get
  // a signer that is already registered as trusted in the contract.
  const privateKey = process.env.VERIFIER_PRIVATE_KEY

  // Generate a VerificationResult, a pair of the VerificationRecord and a
  // signature.
  const result = await verificationResult(
    subjectAddress,
    registryAddress,
    privateKey,
    chainId
  )

  // When broadcasting a transaction to the network, it must be done using a
  // Provider.
  const provider = getProvider()

  // A signer is necessary to register the verification with the registry.
  const signer = new Wallet(privateKey, provider)

  // Load the Contract
  const registryArtifact = registryContractArtifact()
  const registry = new Contract(registryAddress, registryArtifact.abi, signer)

  // Register the Verification with the registry. This transaction requires
  // gas, so the verifier should maintain an adequate ETH balance to perform
  // its duties.
  const tx = await registry.registerVerification(
    result.verificationResult,
    result.signature
  )

  // The transaction will need to be mined before the subject will be found in
  // the registry. In this example, we wait until it is mined, however, locally
  // HardHat will auto-mine a block for each transaction, so it will be
  // performed near instantaneously. Ethereum has an average block time of
  // around 13 seconds.
  await tx.wait()

  // return the result object to the calling client
  res.status(200).json(result)
})
