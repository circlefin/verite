import { VerificationInfoResponse, verificationResult } from "@centre/verity"
import { apiHandler, requireMethod } from "../../../lib/api-fns"

export default apiHandler<VerificationInfoResponse>(async (req, res) => {
  // TODO the api should handle a GET poll with the subject addr is on the query str
  // (as a dynamic api route) to enable the dApp to know when async verification
  // eventually succeeds or fails. Meanwhile, this verifier stubs out actual
  // verification through a POST request executed by the dapp:
  requireMethod(req, "POST")

  // the dapp sends its own calling address to the verifier, and though the
  // verifier does not need to confirm ownership of the address, it includes
  // the address in the signed digest so that the contract can confirm it
  // and no other subject can use this signed VerificationInfo
  const subjectAddress = req.body.subjectAddress

  // Use the contract's remote address as part of the domain separator in the hash
  const contractAddress = req.body.contractAddress

  // A production verifier would integrate with its own persistent wallet, but
  // this example merely regenerates a new signer trusted signer when needed.
  // We use the same mnemonic here that the deploy script used in order to get
  // a signer that is already registered as trusted in the contract.
  const mnemonic =
    "announce room limb pattern dry unit scale effort smooth jazz weasel alcohol"

  const result = await verificationResult(
    subjectAddress,
    contractAddress,
    mnemonic
  )

  // return the result object to the calling client
  res.status(200).json(result)
})
