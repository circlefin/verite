/**
 * SPDX-License-Identifier: MIT
 *
 * Copyright (c) 2018-2020 CENTRE SECZ
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "hardhat/console.sol";

contract VerificationValidator is Ownable, EIP712("VerificationValidator", "1.0") {

    /**
    * Trusted verifier addresses that sign verification results, mapped to
    * the identitifier (such as a DID) of the verifier.
    */
    mapping(address => bytes32) private _verifiers;

    /**
    * The KYCVerificationInfo contains information from a verifier about a 
    * successful verification result. The verifier signs a hash of this object
    * and the contract uses the object to recreate that hash. It then uses the
    * recreated hash and the signature to validate the verifier's public eth 
    * address, which is checked against the trusted verifiers known to this 
    * contract. The contract can also use properties in the object to adjust its
    * contract logic, if appropriate.
    * 
    * In this example, the subjectAddress is included in the verifier hash but 
    * the contract ALWAYS uses msg.sender as the subjectAddress when regenerating 
    * the hash in order to prevent replay attacks, so subjectAddress is not necessary 
    * in the struct.
    */
    struct KYCVerificationInfo {
        string message;
        uint256 expiration;
    }

    /**
     * CreditScoreVerificationInfo contains information about a seccuessful verification
     * result. See KYCVerficationInfo above for details. In this pattern, different typed
     * results are used for specific kinds of verifications as opposed to a single general
     * type for all verifications. These are implemenation decisions left to the contract 
     * developer. Other contracts may warrant a different pattern.
     */
    struct CreditScoreVerificationInfo {
        string message;
        uint256 expiration;
        uint256 score;
    }

    event VerifierAdded(address verifier, bytes32 verifierID);
    event VerifierRemoved(address verifier);
    event VerifiedCredentialConfirmed(
        address verifierAddress,
        bytes32 verificationInfo
    );

    modifier onlyTrustedVerifier() {
        require(
            _verifiers[msg.sender] != 0,
            "VerificationValidator: caller is not a trusted verifier"
        );
        _;
    }

    /**
     * The owner/admin adds a trusted verifier address to the contract.
     */
    function addTrustedVerifier(address signingAddr, bytes32 verifierID) external onlyOwner {
        _verifiers[signingAddr] = verifierID;
        emit VerifierAdded(signingAddr, verifierID);
    }

    /**
     * The owner/admin removes a trusted verifier address from the contract.
     */
    function removeTrustedVerifier(address signingAddr) external onlyOwner {
        _verifiers[signingAddr] = 0;
        emit VerifierRemoved(signingAddr);
    }

    /**
     * A trusted verifier can update its own identifier/DID.
     */
    function updateVerifierID(address signingAddr, bytes32 verifierID) external onlyTrustedVerifier {
        _verifiers[signingAddr] = verifierID;
    }

    /**
     * Query whether an address is a trusted verifier.
     */
    function isTrustedVerifier(address account) external view returns (bool) {
        return _verifiers[account] != 0;
    }

    /**
     * Query the identitifer/DID of a trusted verifier based on its signing address.
     * Note this could be locked down to be accessible only to the contract owner, or
     * only if the caller is a trusted verifier (and only to its own identifier). 
     */
    function getVerifierID(address signingAddr) external view returns (bytes32) {
        require(_verifiers[signingAddr] != 0, "VerificationValidator: Unknown Verifier Address");
        return _verifiers[signingAddr];
    }

    /**
     * A verifier provides a signed hash of a verification result it 
     * has created for a subject address. This function recreates the hash 
     * given the result artifacts and then uses it and the signature to recover 
     * the public address of the signer. If that address is a trusted verifier 
     * address, and the assessment completes within the deadline (unix time in 
     * seconds since epoch), then the verification succeeds and can be reused 
     * by this specific caller until the confirmation expires.
     */
    function validateKYCVerification(
        KYCVerificationInfo memory info, 
        bytes memory signature
    ) internal {
        // Recreate the hash using the verification results data. The expiration and subject
        // are signed in the hash in order to prevent verified clients from setting or changing 
        // their own expiration times, and to prevent other subjects from using this same verification.
        // The subject address is not read from the results parameter, but rather always forced 
        // to be msg.sender.
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
          keccak256("KYCVerificationInfo(string message,uint256 expiration,address subjectAddress)"),
          keccak256(bytes(info.message)),
          info.expiration,
          msg.sender
        )));
        _validateVerifier(digest, signature, info.expiration);
    }

    /**
    * An example validation of a credit score verification. See validateKYCVerification for details.
    */
    function validateCreditScoreVerification(
        CreditScoreVerificationInfo memory info,
        bytes memory signature
    ) internal {
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
          keccak256("CreditScoreVerificationInfo(string message,uint256 expiration,uint256 score,address subjectAddress)"),
          keccak256(bytes(info.message)),
          info.expiration,
          info.score,
          msg.sender
        )));
        _validateVerifier(digest, signature, info.expiration);
    }

    /**
     * This private function completes the validation process by recovering a signer 
     * based on a reconstituted hash and a signature, confirms that the address is
     * a trusted verifier, confirms that the result has not expired, and emits an
     * event upon success. In this example, any trusted verifier is valid for any 
     * type of verification (as opposed to maintaining separate trusted verifiers
     * for different credential types).
     */
    function _validateVerifier(
        bytes32 digest, 
        bytes memory signature, 
        uint256 expiration
    ) private {

         // use OpenZeppelin ECDSA to recover the public address corresponding to the 
         // signature and regenerated hash:
        address signer = ECDSA.recover(digest, signature);
        
        require(
            _verifiers[signer] != 0,
            "Verifiable Credential: Signed digest cannot be verified"
        );
        require(
            expiration > block.timestamp,
            "Verifiable Credential: Verification confirmation expired"
        );

        emit VerifiedCredentialConfirmed(signer, digest);
    }
}
