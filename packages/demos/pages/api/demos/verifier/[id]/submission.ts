import { Contract } from "@ethersproject/contracts"
import { Wallet } from "@ethersproject/wallet"
import {
  validateVerificationSubmission,
  VerificationResultResponse,
  verificationResult
} from "verite"
import type { EncodedPresentationSubmission } from "verite"
import { apiHandler, requireMethod } from "../../../../../lib/api-fns"
import {
  findVerificationOffer,
  updateVerificationOfferStatus
} from "../../../../../lib/database/verificationRequests"
import { NotFoundError } from "../../../../../lib/errors"
import {
  getProvider,
  registryContractArtifact
} from "../../../../../lib/eth-fns"

type PostResponse = { status: string; result?: VerificationResultResponse }

/**
 * POST request handler
 *
 * Accepts and verifies a `VerificationSubmission`, and updates it's status.
 * This API call is synchronous so the verification status will be in its final
 * state. A more robust solution might return a pending status and require the
 * client to poll its status.
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

  // If a subjectAddress and registryAddress are given, we will return a
  // verification result suitable for the ETH network.
  //
  // Note that the VerificationRegistry contract will use its own address as
  // part of the EIP-712 domain separator. If a contract uses a separate
  // deployed contract for its registry, the address will be different from
  // the contract. If a contract inherits the VerificationRegistry, they will
  // be one and the same.
  //
  // For this demo, we allow the client to pass in the registry address, but
  // that may be unsuitable for a production environment.
  const subjectAddress = req.query.subjectAddress as string
  const registryAddress = req.query.registryAddress as string

  let result: VerificationResultResponse
  if (subjectAddress && registryAddress) {
    result = await verificationResult(
      subjectAddress,
      registryAddress,
      process.env.VERIFIER_PRIVATE_KEY,
      parseInt(process.env.NEXT_PUBLIC_ETH_NETWORK, 10)
    )
  }

  if (req.query.verifierSubmit && registryAddress) {
    try {
      // When broadcasting a transaction to the network, it must be done using a
      // Provider.
      const provider = getProvider()

      // A signer is necessary to register the verification with the registry.
      const signer = new Wallet(process.env.VERIFIER_PRIVATE_KEY, provider)

      // Load the Registry Contract
      const registryArtifact = registryContractArtifact()
      const registry = new Contract(
        registryAddress,
        registryArtifact.abi,
        signer
      )

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
    } catch (error) {
      // If the transaction is not mined, it'll throw an exception. Since this
      // is the verifier submission workflow, we'll reject the verification at
      // this step.
      await updateVerificationOfferStatus(
        verificationRequest.id,
        "rejected",
        result
      )
      throw error
    }
  }

  // If we've made it this far, the verification is approved.
  await updateVerificationOfferStatus(
    verificationRequest.id,
    "approved",
    result
  )

  if (result) {
    res.json({ status: "approved", result })
  } else {
    res.json({ status: "approved" })
  }
})
