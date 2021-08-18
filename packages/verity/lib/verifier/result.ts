import { ethers, Wallet } from "ethers"
import type { KYCVerificationInfo, VerificationInfoResponse } from "../../types"

export const verificationResult = async (
  subjectAddress: string,
  contractAddress: string,
  mnemonic: string
): Promise<VerificationInfoResponse> => {
  // A production verifier would integrate with its own persistent wallet, but
  // this example merely regenerates a new signer trusted signer when needed.
  // We use the same mnemonic here that the deploy script used in order to get
  // a signer that is already registered as trusted in the contract.
  const signer: Wallet = ethers.Wallet.fromMnemonic(mnemonic)

  // This would be best done from current block.timestamp. Expirations allow verifiers
  // to control how long a particular result is considered valid. Block timestanps
  // are denoted in seconds since the epoch.
  const expiration = Math.floor(Date.now() / 1000) + 300 // 5 mins

  // VerificationInfo objects are encoded, hashed, and signed following EIP-712
  // See https://eips.ethereum.org/EIPS/eip-712

  // Use the contract's remote address as part of the domain separator in the hash
  const domain = {
    name: "VerificationValidator",
    version: "1.0",
    chainId: 3,
    verifyingContract: contractAddress
  }

  const types = {
    KYCVerificationInfo: [
      { name: "message", type: "string" },
      { name: "expiration", type: "uint256" },
      { name: "subjectAddress", type: "address" }
    ]
  }

  // The dapp sends its own calling address to the verifier, and though the
  // verifier does not need to confirm ownership of the address, it includes
  // the address in the signed digest so that the contract can confirm it
  // and no other subject can use this signed VerificationInfo
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

  return verificationInfoSet
}
