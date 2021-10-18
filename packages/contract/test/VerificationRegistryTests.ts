import { ethers } from "hardhat"
import { expect } from "chai"
import { Contract, Wallet } from "ethers"

describe("VerificationRegistry", function () {
  // create a wallet to generate a private key for signing verification results
  //const signer: Wallet = ethers.Wallet.createRandom()
  const mnemonic =
    "announce room limb pattern dry unit scale effort smooth jazz weasel alcohol"
  const signer: Wallet = ethers.Wallet.fromMnemonic(mnemonic)
  // deploy the contract, which makes this test the contract's owner
  let verificationRegistry: Contract
  let verifierPubAddr: string
  it("Should deploy", async function () {
    const deployer = await ethers.getContractFactory("VerificationRegistry")
    verificationRegistry = await deployer.deploy()
    await verificationRegistry.deployed()
    verifierPubAddr = verificationRegistry.deployTransaction.from
  })

  it("Should not find a verifier DID for an untrusted address", async function () {
    await expect(verificationRegistry.getVerifier(signer.address)).to.be
      .reverted
  })

  const testVerifierInfo = {
    name: ethers.utils.formatBytes32String("Centre Consortium"),
    did: "did:web:centre.io",
    url: "https://centre.io/about",
    signer: signer.address
  }

  // make this test's a verifier in the contract
  it("Should become a registered verifier", async function () {
    const setVerifierTx = await verificationRegistry.addVerifier(
      signer.address,
      testVerifierInfo
    )
    // wait until the transaction is mined
    await setVerifierTx.wait()
  })

  it("Should ensure signer address maps to a verifier", async function () {
    const isVerifier = await verificationRegistry.isVerifier(signer.address)
    expect(isVerifier).to.be.true
  })

  it("Should have one verifier", async function () {
    const verifierCount = await verificationRegistry.getVerifierCount()
    expect(verifierCount).to.be.equal(1)
  })

  it("Should find a verifier for signer address", async function () {
    const retrievedVerifierInfo = await verificationRegistry.getVerifier(
      signer.address
    )
    expect(retrievedVerifierInfo.name).to.equal(testVerifierInfo.name)
    expect(retrievedVerifierInfo.did).to.equal(testVerifierInfo.did)
    expect(retrievedVerifierInfo.url).to.equal(testVerifierInfo.url)
  })

  it("Should update an existing verifier", async function () {
    testVerifierInfo.url = ethers.utils.formatBytes32String("https://centre.io")
    const setVerifierTx = await verificationRegistry.updateVerifier(
      signer.address,
      testVerifierInfo
    )
    // wait until the transaction is mined
    await setVerifierTx.wait()
    const retrievedVerifierInfo = await verificationRegistry.getVerifier(
      signer.address
    )
    expect(retrievedVerifierInfo.url).to.equal(testVerifierInfo.url)
  })

  it("Should remove a verifier", async function () {
    const removeVerifierTx = await verificationRegistry.removeVerifier(
      signer.address
    )
    // wait until the transaction is mined
    await removeVerifierTx.wait()
    const verifierCount = await verificationRegistry.getVerifierCount()
    expect(verifierCount).to.be.equal(0)
  })

  // now register a new verifier delegate for verification tests
  it("Should register a new verifier", async function () {
    const setVerifierTx = await verificationRegistry.addVerifier(
      verifierPubAddr,
      testVerifierInfo
    )
    // wait until the transaction is mined
    await setVerifierTx.wait()
    const verifierCount = await verificationRegistry.getVerifierCount()
    expect(verifierCount).to.be.equal(1)
  })

  // get a deadline beyond which the verification expires
  let expiration: number
  it("Should create a deadline in seconds based on last block timestamp", async function () {
    // note in your own code, consider providing your own API keys ( see https://docs.ethers.io/api-keys/ )
    const provider = ethers.getDefaultProvider()
    const lastBlockNumber: number = await provider.getBlockNumber()
    const lastBlock = await provider.getBlock(lastBlockNumber)
    expiration = lastBlock.timestamp + 300
  })

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
        { name: "expiration", type: "uint256" }
      ]
    }

    verificationInfo = {
      schema: "centre.io/credentials/kyc",
      subject: verifierPubAddr,
      expiration: expiration
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
    const isVerified = await verificationRegistry.isVerified(verifierPubAddr)
    expect(isVerified).to.be.false
  })

  // execute the contract's proof of the verification
  it("Should register the caller as verified and create a Verification Record", async function () {
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
    const isVerified = await verificationRegistry.isVerified(verifierPubAddr)
    expect(isVerified).to.be.true
  })

  let recordUUID = 0

  // get all verifications for a subject
  it("Get all verifications for a subject address", async function () {
    const records = await verificationRegistry.getVerificationsForSubject(
      verifierPubAddr
    )
    recordUUID = records[0].uuid
    expect(records.length).to.equal(1)
  })

  // get all verifications for a verifier
  it("Get all verifications for a verifier address", async function () {
    const records = await verificationRegistry.getVerificationsForVerifier(
      verifierPubAddr
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

  /*
  // attempt a transfer before the sender is verified
  it("Should fail to execute a transfer when the caller is not yet verified", async function () {
    await expect(
      VerificationRegistry.transfer(VerificationRegistry.deployTransaction.from, 100)
    ).to.be.reverted;
  });

  // execute the contract's proof of the verification
  it("Should verify the caller and transfer funds", async function () {
    const verificationTx = await VerificationRegistry.validateAndTransfer(
      VerificationRegistry.deployTransaction.from,
      100,
      verificationInfo,
      signature
    );
    await verificationTx.wait();
  });

  // allow reuse of result until deadline expires -- execute test again
  it("Should reuse the verification result and transfer funds again", async function () {
      const verificationTx = await VerificationRegistry.validateAndTransfer(
        VerificationRegistry.deployTransaction.from, 100, verificationInfo, signature);
      await verificationTx.wait();
    });

  it("Should create an expired result and fail to verify it", async function () {
    verificationInfo["expiration"] = (expiration - 600);
    signature = await signer._signTypedData(domain, types, verificationInfo);
    await expect(VerificationRegistry.validateAndTransfer
      (VerificationRegistry.deployTransaction.from, 100, verificationInfo, signature)
    ).to.be.reverted;
  });
  */
})
