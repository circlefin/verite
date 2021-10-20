import { ethers } from "hardhat"
import { expect } from "chai"
import { Contract, Wallet } from "ethers"

describe("VerificationValidator", function () {
  /*
  // create a wallet to generate a private key for signing verification results
  const signer: Wallet = ethers.Wallet.createRandom();
  
  // deploy the contract, which makes this test the contract's admin
  let verificationValidator: Contract;
  let verifierPubAddr: string;
  it("Should deploy", async function () {
    const deployer = await ethers.getContractFactory("Token");
    verificationValidator = await deployer.deploy();
    await verificationValidator.deployed();
    verifierPubAddr = verificationValidator.deployTransaction.from;
  });

  it("Should not find a verifier DID for an untrusted address", async function() {
    await expect(verificationValidator.getVerifierID(signer.address)).to.be.reverted;
  });

  // make this test's signer a trusted verifier in the contract
  const verifierTestDID = "did:web:verity.id";
  it("Should become a trusted verifier", async function () {
    const setVerifierTx = await verificationValidator.addTrustedVerifier(
      signer.address, ethers.utils.formatBytes32String(verifierTestDID)
    );
    // wait until the transaction is mined
    await setVerifierTx.wait();
  });

  it("Should find a verifier DID for a trusted address", async function() {
    const verifierDIDBytes32 = await verificationValidator.getVerifierID(signer.address);
    const verifierDID = ethers.utils.parseBytes32String(verifierDIDBytes32);
    expect(verifierDID).to.equal(verifierTestDID);
  });

  // get a deadline beyond which the verification expires
  let expiration: number;
  it("Should create a deadline in seconds based on last block timestamp", async function () {
    // note in your own code, consider providing your own API keys ( see https://docs.ethers.io/api-keys/ )
    const provider = ethers.getDefaultProvider();
    const lastBlockNumber: number = await provider.getBlockNumber();
    const lastBlock = await provider.getBlock(lastBlockNumber);
    expiration = lastBlock.timestamp + 300;
  });

  let domain, types, verificationInfo = {};
  it("Should format a structured verification result", async function () {
    domain = {
      name: "VerificationValidator",
      version: "1.0",
      chainId: 1337,
      verifyingContract: (await verificationValidator.resolvedAddress)
    };

    types = {
      KYCVerificationInfo: [
        { name: "message", type: "string" },
        { name: "expiration", type: "uint256" },
        { name: "subjectAddress", type: "address" }
      ]
    };

    verificationInfo = {
      message: "KYC Issuer: did:web:verity.id",
      expiration: expiration,
      subjectAddress: verificationValidator.deployTransaction.from,
    };
  });

  // create a digest and sign it
  let signature: string;
  it("Should sign and verify typed data", async function () {
    signature = await signer._signTypedData(domain, types, verificationInfo);
    let verifiedAddr = ethers.utils.verifyTypedData(domain, types, verificationInfo, signature);
    expect(signer.address).to.equal(verifiedAddr);
  });

  // attempt a transfer before the sender is verified
  it("Should fail to execute a transfer when the caller is not yet verified", async function () {
    await expect(
      verificationValidator.transfer(verificationValidator.deployTransaction.from, 100)
    ).to.be.reverted;
  });

  // execute the contract's proof of the verification
  it("Should verify the caller and transfer funds", async function () {
    const verificationTx = await verificationValidator.validateAndTransfer(
      verificationValidator.deployTransaction.from,
      100,
      verificationInfo,
      signature
    );
    await verificationTx.wait();
  });

  // allow reuse of result until deadline expires -- execute test again
  it("Should reuse the verification result and transfer funds again", async function () {
      const verificationTx = await verificationValidator.validateAndTransfer(
        verificationValidator.deployTransaction.from, 100, verificationInfo, signature);
      await verificationTx.wait();
    });

  it("Should create an expired result and fail to verify it", async function () {
    verificationInfo["expiration"] = (expiration - 600);
    signature = await signer._signTypedData(domain, types, verificationInfo);
    await expect(verificationValidator.validateAndTransfer
      (verificationValidator.deployTransaction.from, 100, verificationInfo, signature)
    ).to.be.reverted;
  });
  */
})
