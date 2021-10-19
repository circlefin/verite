import { ethers } from "hardhat"
import { expect } from "chai"
import { Contract, Wallet } from "ethers"

describe("VerificationRegistry", function () {
  // create a wallet to generate a private key for signing verification results
  const mnemonic =
    "announce room limb pattern dry unit scale effort smooth jazz weasel alcohol"
  const signer: Wallet = ethers.Wallet.fromMnemonic(mnemonic)

  // get a random subject address that will be used for verified subject tests
  let subjectAddress: string
  it("Should find a random address to use as a subject to verifiy", async function () {
    const addresses = await ethers.getSigners()
    const r = Math.floor(Math.random() * addresses.length)
    subjectAddress = await addresses[r].getAddress()
  })

  // deploy the contract, which makes this test the contract's owner
  let verificationRegistry: Contract
  let contractOwnerAddress: string
  it("Should deploy", async function () {
    const deployer = await ethers.getContractFactory("VerificationRegistry")
    verificationRegistry = await deployer.deploy()
    await verificationRegistry.deployed()
    contractOwnerAddress = verificationRegistry.deployTransaction.from
  })

  it("Should not find a verifier DID for an untrusted address", async function () {
    await expect(verificationRegistry.getVerifier(contractOwnerAddress)).to.be
      .reverted
  })

  const testVerifierInfo = {
    name: ethers.utils.formatBytes32String("Centre Consortium"),
    did: "did:web:centre.io",
    url: "https://centre.io/about",
    signer: signer.address
  }

  // make the contact's owner a verifier in the contract
  it("Should become a registered verifier", async function () {
    const setVerifierTx = await verificationRegistry.addVerifier(
      contractOwnerAddress,
      testVerifierInfo
    )
    // wait until the transaction is mined
    await setVerifierTx.wait()
  })

  it("Should ensure owner address maps to a verifier", async function () {
    const isVerifier = await verificationRegistry.isVerifier(
      contractOwnerAddress
    )
    expect(isVerifier).to.be.true
  })

  it("Should have one verifier", async function () {
    const verifierCount = await verificationRegistry.getVerifierCount()
    expect(verifierCount).to.be.equal(1)
  })

  it("Should find a verifier for owner address", async function () {
    const retrievedVerifierInfo = await verificationRegistry.getVerifier(
      contractOwnerAddress
    )
    expect(retrievedVerifierInfo.name).to.equal(testVerifierInfo.name)
    expect(retrievedVerifierInfo.did).to.equal(testVerifierInfo.did)
    expect(retrievedVerifierInfo.url).to.equal(testVerifierInfo.url)
  })

  it("Should update an existing verifier", async function () {
    testVerifierInfo.url = "https://centre.io"
    const setVerifierTx = await verificationRegistry.updateVerifier(
      contractOwnerAddress,
      testVerifierInfo
    )
    // wait until the transaction is mined
    await setVerifierTx.wait()
    const retrievedVerifierInfo = await verificationRegistry.getVerifier(
      contractOwnerAddress
    )
    expect(retrievedVerifierInfo.url).to.equal(testVerifierInfo.url)
  })

  it("Should remove a verifier", async function () {
    const removeVerifierTx = await verificationRegistry.removeVerifier(
      contractOwnerAddress
    )
    // wait until the transaction is mined
    await removeVerifierTx.wait()
    const verifierCount = await verificationRegistry.getVerifierCount()
    expect(verifierCount).to.be.equal(0)
  })

  // now register a new verifier delegate for verification tests
  it("Should register a new verifier", async function () {
    const setVerifierTx = await verificationRegistry.addVerifier(
      contractOwnerAddress,
      testVerifierInfo
    )
    // wait until the transaction is mined
    await setVerifierTx.wait()
    const verifierCount = await verificationRegistry.getVerifierCount()
    expect(verifierCount).to.be.equal(1)
  })

  // get a deadline beyond which a test verification will expire
  // note this uses an external scanner service that is rate-throttled
  // add your own API keys to avoid the rate throttling
  // see https://docs.ethers.io/api-keys/
  const expiration = 9999999999
  /*it("Should create a deadline in seconds based on last block timestamp", async function () {
    const provider = ethers.getDefaultProvider()
    const lastBlockNumber: number = await provider.getBlockNumber()
    const lastBlock = await provider.getBlock(lastBlockNumber)
    expiration = lastBlock.timestamp + 300
  })*/

  // format an EIP712 typed data structure for the test verification result
  let domain,
    types,
    verificationInfo = {}
  it("Should format a structured verification result", async function () {
    domain = {
      name: "VerificationRegistry",
      version: "1.0",
      chainId: 1337,
      verifyingContract: await verificationRegistry.resolvedAddress
    }

    types = {
      VerificationResult: [
        { name: "schema", type: "string" },
        { name: "subject", type: "address" },
        { name: "expiration", type: "uint256" },
        { name: "payload", type: "bytes32" }
      ]
    }

    verificationInfo = {
      schema: "centre.io/credentials/kyc",
      subject: subjectAddress,
      expiration: expiration,
      payload: ethers.utils.formatBytes32String("example")
    }
  })

  // create a digest and sign it
  let signature: string
  it("Should sign and verify typed data", async function () {
    signature = await signer._signTypedData(domain, types, verificationInfo)
    const recoveredAddress = ethers.utils.verifyTypedData(
      domain,
      types,
      verificationInfo,
      signature
    )
    expect(recoveredAddress).to.equal(testVerifierInfo.signer)
  })

  // test whether a subject address has a verification and expect false
  it("Should see the subject has no registered valid verification record", async function () {
    const isVerified = await verificationRegistry.isVerified(
      contractOwnerAddress
    )
    expect(isVerified).to.be.false
  })

  // execute the contract's proof of the verification
  it("Should register the subject as verified and create a Verification Record", async function () {
    const verificationTx = await verificationRegistry.registerVerification(
      verificationInfo,
      signature
    )
    await verificationTx.wait()
    const verificationCount = await verificationRegistry.getVerificationCount()
    expect(verificationCount).to.be.equal(1)
  })

  // test whether a subject address has a verification
  it("Should verify the subject has a registered and valid verification record", async function () {
    const isVerified = await verificationRegistry.isVerified(subjectAddress)
    expect(isVerified).to.be.true
  })

  let recordUUID = 0

  // get all verifications for a subject
  it("Get all verifications for a subject address", async function () {
    const records = await verificationRegistry.getVerificationsForSubject(
      subjectAddress
    )
    recordUUID = records[0].uuid
    expect(records.length).to.equal(1)
  })

  // get all verifications for a verifier
  it("Get all verifications for a verifier address", async function () {
    const records = await verificationRegistry.getVerificationsForVerifier(
      contractOwnerAddress
    )
    recordUUID = records[0].uuid
    expect(records.length).to.equal(1)
  })

  // get a specific verification record by its uuid
  it("Get a verification using its uuid", async function () {
    const record = await verificationRegistry.getVerification(recordUUID)
    expect(ethers.utils.getAddress(record.subject)).not.to.throw
  })

  // revoke a verification
  it("Revoke a verification based on its uuid", async function () {
    await verificationRegistry.revokeVerification(recordUUID)
    const record = await verificationRegistry.getVerification(recordUUID)
    expect(record.revoked).to.be.true
  })

  // a subject can remove verifications about itself -- note nothing on chains is really ever removed
  it("Allow a subject to remove verfications about its address", async function () {
    let record = await verificationRegistry.getVerification(recordUUID)
    expect(ethers.utils.getAddress(record.subject)).not.to.throw
    const removeTx = await verificationRegistry.removeVerification(recordUUID)
    removeTx.wait()
    record = await verificationRegistry.getVerification(recordUUID)
    expect(ethers.utils.getAddress(record.subject)).to.throw
  })
})
