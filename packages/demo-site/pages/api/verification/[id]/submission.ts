import {
  processVerificationSubmission,
  VerificationInfoResponse,
  KYCVerificationInfo
} from "@centre/verity"
import type { EncodedVerificationSubmission } from "@centre/verity"
import { ethers, Wallet } from "ethers"
import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import {
  findVerificationRequest,
  updateVerificationRequestStatus
} from "../../../../lib/database/verificationRequests"
import { NotFoundError, ProcessingError } from "../../../../lib/errors"

type PostResponse = { status: string; result?: VerificationInfoResponse }

/**
 * POST request handler
 *
 * Accepts and verifies a `VerificationSubmission`, and updates it's status
 */
export default apiHandler<PostResponse>(async (req, res) => {
  requireMethod(req, "POST")

  const submission: EncodedVerificationSubmission = req.body
  const verificationRequest = await findVerificationRequest(
    req.query.id as string
  )

  if (!verificationRequest) {
    throw new NotFoundError()
  }

  try {
    const processedSubmission = await processVerificationSubmission(
      submission,
      verificationRequest.presentation_definition
    )

    if (!processedSubmission.accepted()) {
      throw new ProcessingError(processedSubmission.errors())
    }
  } catch (err) {
    await updateVerificationRequestStatus(
      verificationRequest.request.id,
      "rejected"
    )

    throw err
  }

  // If a subjectAddress and contractAddress are given, we will return a
  // verification result suitable for the ETH network
  const subjectAddress = req.query.subjectAddress as string
  const contractAddress = req.query.contractAddress as string
  let result: VerificationInfoResponse
  if (subjectAddress && contractAddress) {
    result = await verificationResult(subjectAddress, contractAddress)
  }

  await updateVerificationRequestStatus(
    verificationRequest.request.id,
    "approved",
    result
  )

  if (result) {
    res.json({ status: "approved", result })
  } else {
    res.json({ status: "approved" })
  }
})

/**
 * This method is mostly copy pasted from Verity repo.
 * https://github.com/centrehq/verity/blob/main/packages/verity-contract-example/frontend/pages/api/verifier.ts
 *
 * @param subjectAddress The calling address (the user's ETH address)
 * @param contractAddress Use the contract's remote address as part of the domain separator in the hash
 * @returns
 */
const verificationResult = async (
  subjectAddress: string,
  contractAddress: string
) => {
  // TODO the api should handle a GET poll with the subject addr is on the query str
  // (as a dynamic api route) to enable the dApp to know when async verification
  // eventually succeeds or fails. Meanwhile, this verifier stubs out actual
  // verification through a POST request executed by the dapp:

  // the dapp sends its own calling address to the verifier, and though the
  // verifier does not need to confirm ownership of the address, it includes
  // the address in the signed digest so that the contract can confirm it
  // and no other subject can use this signed VerificationInfo
  // const subjectAddress = req.body.subjectAddress;

  // A production verifier would integrate with its own persistent wallet, but
  // this example merely regenerates a new signer trusted signer when needed.
  // We use the same mnemonic here that the deploy script used in order to get
  // a signer that is already registered as trusted in the contract.
  const mnemonic =
    "announce room limb pattern dry unit scale effort smooth jazz weasel alcohol"
  const signer: Wallet = ethers.Wallet.fromMnemonic(mnemonic)

  // Use the contract's remote address as part of the domain separator in the hash
  // const contractAddress = req.body.contractAddress;

  // This would be best done from current block.timestamp. Expirations allow verifiers
  // to control how long a particular result is considered valid. Block timestanps
  // are denoted in seconds since the epoch.
  const expiration = Math.floor(Date.now() / 1000) + 300 // 5 mins

  // VerificationInfo objects are encoded, hashed, and signed following EIP-712
  // See https://eips.ethereum.org/EIPS/eip-712

  const domain: Record<string, unknown> = {
    name: "VerificationValidator",
    version: "1.0",
    chainId: 1337,
    verifyingContract: contractAddress
  }

  const types: Record<string, any[]> = {
    KYCVerificationInfo: [
      { name: "message", type: "string" },
      { name: "expiration", type: "uint256" },
      { name: "subjectAddress", type: "address" }
    ]
  }

  const verificationInfo: KYCVerificationInfo = {
    message: "KYC:did:web:verity.id:TT1231",
    expiration: expiration,
    subjectAddress: subjectAddress
  }

  // sign the structured result
  const signature = await signer._signTypedData(domain, types, verificationInfo)

  const verificationInfoSet: VerificationInfoResponse = {
    verificationInfo: verificationInfo,
    signature: signature
  }

  // return the result object to the calling client
  return verificationInfoSet
}
