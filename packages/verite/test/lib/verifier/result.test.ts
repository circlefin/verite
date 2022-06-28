import { ethers } from "ethers"

import { verificationResult } from "../../../lib/verifier/result"

describe("verificationResult", () => {
  const subjectAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  const verifierPrivateKey =
    "0x1da6847600b0ee25e9ad9a52abbd786dd2502fa4005dd5af9310b7cc7a3b25db"
  const verificationPublicKey = "0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1"
  const chainId = 1337

  it("creates a Verification Result with a signature", async () => {
    const result = await verificationResult(
      subjectAddress,
      contractAddress,
      verifierPrivateKey,
      chainId
    )

    expect(result).toMatchObject({
      // signature: "0x19e88da2f358047dc6c2388115c037dc0fa4f6e8af1b3a6ee61af5af1972457c11374071d0e44db96b05eb8fb8a6b85398879b938ca1ff00c99db856bafb885a1c",
      verificationResult: {
        // expiration: 1636574690,
        schema: "centre.io/credentials/kyc",
        subject: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      }
    })

    // With the Verification Result and signature, we can recover the signer to
    // validate the signer is an approved verifier.
    const domain = {
      name: "VerificationRegistry",
      version: "1.0",
      chainId,
      verifyingContract: contractAddress
    }
    const types = {
      VerificationResult: [
        { name: "schema", type: "string" },
        { name: "subject", type: "address" },
        { name: "expiration", type: "uint256" }
      ]
    }

    const recoveredAddress = ethers.utils.verifyTypedData(
      domain,
      types,
      result.verificationResult,
      result.signature
    )

    expect(recoveredAddress).toEqual(verificationPublicKey)
  })

  it("allows for custom schemas", async () => {
    const result = await verificationResult(
      subjectAddress,
      contractAddress,
      verifierPrivateKey,
      chainId,
      "centre.io/credentials/address"
    )

    expect(result).toMatchObject({
      verificationResult: {
        schema: "centre.io/credentials/address",
        subject: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      }
    })
  })
})
