import { Contract } from "@ethersproject/contracts"
import { Wallet } from "@ethersproject/wallet"
import {
  validateVerificationSubmission,
  VerificationResultResponse,
  verificationResult
} from "@verity/core"
import type { EncodedPresentationSubmission } from "@verity/core"
import { getProvider } from "@verity/demos/lib/eth-fns"
import TokenArtifact from "../../../../../contracts/ThresholdToken.json"
import { apiHandler, requireMethod } from "../../../../../lib/api-fns"
import {
  findVerificationOffer,
  updateVerificationOfferStatus
} from "../../../../../lib/database/verificationRequests"
import { NotFoundError } from "../../../../../lib/errors"

type PostResponse = { status: string; result?: VerificationResultResponse }

/**
 * POST request handler
 *
 * Accepts and verifies a `VerificationSubmission`, and updates it's status
 */
export default apiHandler<PostResponse>(async (req, res) => {
  requireMethod(req, "POST")

  const submission: EncodedPresentationSubmission = req.body
  const verificationRequest = await findVerificationOffer(
    req.query.id as string
  )

  if (!verificationRequest) {
    throw new NotFoundError()
  }

  const options = {
    challenge: verificationRequest.body.challenge
  }

  try {
    await validateVerificationSubmission(
      submission,
      verificationRequest.body.presentation_definition,
      options
    )
  } catch (err) {
    await updateVerificationOfferStatus(verificationRequest.id, "rejected")

    throw err
  }

  // If a subjectAddress and contractAddress are given, we will return a
  // verification result suitable for the ETH network
  const subjectAddress = req.query.subjectAddress as string
  const contractAddress = req.query.contractAddress as string
  let result: VerificationResultResponse
  if (subjectAddress && contractAddress) {
    result = await verificationResult(
      subjectAddress,
      contractAddress,
      process.env.VERIFIER_PRIVATE_KEY,
      parseInt(process.env.NEXT_PUBLIC_ETH_NETWORK, 10)
    )
  }

  await updateVerificationOfferStatus(
    verificationRequest.id,
    "approved",
    result
  )

  if (req.query.verifierSubmit) {
    // When broadcasting a transaction to the network, it must be done using a
    // Provider.
    const provider = getProvider()

    // A signer is necessary to register the verification with the registry.
    const signer = new Wallet(process.env.VERIFIER_PRIVATE_KEY, provider)

    // Load the Contract
    const token = new Contract(contractAddress, TokenArtifact.abi, signer)

    // Register the Verification with the registry. This transaction requires
    // gas, so the verifier should maintain an adequate ETH balance to perform
    // its duties.
    const tx = await token.registerVerification(
      result.verificationResult,
      result.signature
    )

    // The transaction will need to be mined before the subject will be found in
    // the registry. In this example, we wait until it is mined, however, locally
    // HardHat will auto-mine a block for each transaction, so it will be
    // performed near instantaneously. Ethereum has an average block time of
    // around 13 seconds.
    await tx.wait()
  }

  if (result) {
    res.json({ status: "approved", result })
  } else {
    res.json({ status: "approved" })
  }
})
