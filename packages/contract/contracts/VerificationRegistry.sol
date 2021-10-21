/**
 * SPDX-License-Identifier: MIT
 *
 * Copyright (c) 2018-2021 CENTRE SECZ
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

contract VerificationRegistry is Ownable, EIP712("VerificationRegistry", "1.0") {

    /**
    * Info about Verifiers
    */
    struct VerifierInfo {
        bytes32 name;
        string did;
        string url;
        address signer;
    }

    /**
    * A verifier will submit a verification result in this format.
    */
    struct VerificationResult {
        string schema; // indicator of the type of verification result
        address subject; // address of the subject of the verification
        uint256 expiration; // expiration of verification (may or may not be expiration of the VC)
        bytes32 payload; // arbitrary data associated with the verification that may be employed in app logic
    }

    /**
     * The registry will accept VerificationResults submitted to it, 
     * and if valid, will persist them on-chain as VerificationRecords
     */
    struct VerificationRecord {
        bytes32 uuid; // generated in contract, and also enables offchain verifier-persisted info related to verification
        address verifier; // address of verifier, can be used to pull VerifierInfo
        address subject; // address of the subject, the recipient of a successful verification
        uint256 entryTime; // time at which the verification was proven and recorded (not the time of verification)
        uint256 expirationTime; // expiration of verification (may or may not be expiration of the VC)
        bool revoked; // revoked or valid and active
    }

    /**
    * Verifier Delegate addresses that sign verification results mapped to
    * metadata about the Verifier Delegates.
    */
    mapping(address => VerifierInfo) private _verifiers;

    /**
     * Verifier signing keys mapped to verifier addresses
     */
    mapping(address => address) private _signers;

    /**
     * Total number of active registered verifiers
     */
    uint256 _verifierCount;

    // all verification records keyed by their uuids
    mapping(bytes32 => VerificationRecord) private _verifications;

    // verifications mapped to subject addresses (those who receive verifications)
    mapping(address => bytes32[]) private _verificationsForSubject;

    // verfications issued by a given trusted verifier (those who execute verifications)
    mapping(address => bytes32[]) private _verificationsForVerifier;

    // total verifications registered (mapping keys not being enumerable, countable, etc)
    uint256 private _verificationRecordCount;

    /**********************/
    /* EVENT DECLARATIONS */
    /**********************/

    event VerifierAdded(address verifier, VerifierInfo verifierInfo);
    event VerifierUpdated(address verifier, VerifierInfo verifierInfo);
    event VerifierRemoved(address verifier);
    event VerificationResultConfirmed(VerificationRecord verificationRecord);
    event VerificationRevoked(bytes32 uuid);
    event VerificationRemoved(bytes32 uuid);

    modifier onlyVerifier() {
        require(
            _verifiers[msg.sender].name != 0,
            "VerificationRegistry: Caller is not a Verifier Delegate"
        );
        _;
    }

    /*****************************/
    /* VERIFIER MANAGEMENT LOGIC */
    /*****************************/

    /**
     * The Owner adds a Verifier Delegate to the contract.
     */
    function addVerifier(address verifierAddress, VerifierInfo memory verifierInfo) external onlyOwner {
        require(_verifiers[verifierAddress].name == 0, "VerificationRegistry: Verifier Address Exists");
        _verifiers[verifierAddress] = verifierInfo;
        _signers[verifierInfo.signer] = verifierAddress;
        _verifierCount++;
        emit VerifierAdded(verifierAddress, verifierInfo);
    }

    /**
     * Query whether an address is a Verifier Delegate.
     */
    function isVerifier(address account) external view returns (bool) {
        return _verifiers[account].name != 0;
    }

    /**
     * Retrieve the number of registered Verifier Delegates
     */
    function getVerifierCount() external view returns(uint) {
        return _verifierCount;
    }

    /**
     * Request information about a Verifier Delegate based on its signing address.
     */
    function getVerifier(address verifierAddress) external view returns (VerifierInfo memory) {
        require(_verifiers[verifierAddress].name != 0, "VerificationRegistry: Unknown Verifier Address");
        return _verifiers[verifierAddress];
    }

    /**
     * The onwer updates an existing Verifier Delegate's did, URL, and name.
     */
    function updateVerifier(address verifierAddress, VerifierInfo memory verifierInfo) external onlyOwner {
        require(_verifiers[verifierAddress].name != 0, "VerificationRegistry: Unknown Verifier Address");
        _verifiers[verifierAddress] = verifierInfo;
        _signers[verifierInfo.signer] = verifierAddress;
        emit VerifierUpdated(verifierAddress, verifierInfo);
    }

    /**
     * The owner can remove a Verifier Delegate from the contract.
     */
    function removeVerifier(address verifierAddress) external onlyOwner {
        require(_verifiers[verifierAddress].name != 0, "VerificationRegistry: Verifier Address Does Not Exist");
        delete _signers[_verifiers[verifierAddress].signer];
        delete _verifiers[verifierAddress];
        _verifierCount--;
        emit VerifierRemoved(verifierAddress);
    }

    /**********************/
    /* VERIFICATION LOGIC */
    /**********************/

    /**
     * Retrieve the current total number of registered VerificationRecords 
     */
    function getVerificationCount() external view returns(uint256) {
        return _verifierCount;
    }

    /**
     * Determine whether the subject address has a verification record that is not expired
     */
    function isVerified(address subject) external view returns (bool) {
        require(subject != address(0), "VerificationRegistry: Invalid address");
        bytes32[] memory subjectRecords = _verificationsForSubject[subject];
        for (uint i=0; i<subjectRecords.length; i++) {
            VerificationRecord memory record = _verifications[subjectRecords[i]];
            if (!record.revoked && record.expirationTime > block.timestamp) {
                return true;
            }
        }
        return false;
    }

    /**
     * Retrieve a specific Verification Record by its uuid
     */
    function getVerification(bytes32 uuid) external view returns (VerificationRecord memory) {
        return _verifications[uuid];
    }

    /**
     * Retrieve all of the verification records associated with this subject address
     */
    function getVerificationsForSubject(address subject) external view returns (VerificationRecord[] memory) {
        require(subject != address(0), "VerificationRegistry: Invalid address");
        bytes32[] memory subjectRecords = _verificationsForSubject[subject];
        VerificationRecord[] memory records = new VerificationRecord[](subjectRecords.length);
        for (uint i=0; i<subjectRecords.length; i++) {
            VerificationRecord memory record = _verifications[subjectRecords[i]];
            records[i] = record;
        }
        return records;
    }

    /**
     * Retrieve all of the verification records associated with this verifier address
     */
    function getVerificationsForVerifier(address verifier) external view returns (VerificationRecord[] memory) {
        require(verifier != address(0), "VerificationRegistry: Invalid address");
        bytes32[] memory verifierRecords = _verificationsForVerifier[verifier];
        VerificationRecord[] memory records = new VerificationRecord[](verifierRecords.length);
        for (uint i=0; i<verifierRecords.length; i++) {
            VerificationRecord memory record = _verifications[verifierRecords[i]];
            records[i] = record;
        }
        return records;
    }

    /**
     * Verifiers can revoke Verification Records they previously created
     */
    function revokeVerification(bytes32 uuid) external onlyVerifier {
        require(_verifications[uuid].verifier == msg.sender, "VerificationRegistry: Caller is not the original verifier");
        _verifications[uuid].revoked = true;
        emit VerificationRevoked(uuid);
    }

    /**
     * Subjects can remove verifications about themselves, and 
     * verifiers can remove verifications they previously created
     */
    function removeVerification(bytes32 uuid) external {
        require((_verifications[uuid].subject == msg.sender) || (_verifications[uuid].verifier == msg.sender),
            "VerificationRegistry: Caller is neither the subject nor the verifier of the referenced record");
        delete _verifications[uuid];
        emit VerificationRemoved(uuid);
    }

    /**
     * A verifier registers a VerificationResult after it has executed a 
     * successful verification. The contract will validate the result, and
     * if it is valid and is signed by this calling verifier's signer,
     * then the resulting VerificationRecord will be persisted and returned.
     */
    function registerVerification(
        VerificationResult memory verificationResult, 
        bytes memory signature
    ) external onlyVerifier returns (VerificationRecord memory) {
        VerificationRecord memory verificationRecord = _validateVerificationResult(verificationResult, signature);
        require(verificationRecord.verifier == msg.sender, 
            "VerificationRegistry: Caller is not the verifier of the verification");
        _persistVerificationRecord(verificationRecord);
        emit VerificationResultConfirmed(verificationRecord);
        return verificationRecord;
    }

    /**
     * A caller may be the subject of a successful VerificationResult 
     * and register that verification itself rather than rely on the verifier
     * to do so. The contract will validate the result, and if the result
     * is valid, signed by a known verifier, and the subject of the verification 
     * is this caller, then the resulting VerificationRecord will be persisted and returned.
     */
    function registerVerificationBySubject(
        VerificationResult memory verificationResult, 
        bytes memory signature
    ) internal returns (VerificationRecord memory) {
        require(verificationResult.subject == msg.sender, 
            "VerificationRegistry: Caller is not the verified subject");
        VerificationRecord memory verificationRecord = _validateVerificationResult(verificationResult, signature);
        _persistVerificationRecord(verificationRecord);
        emit VerificationResultConfirmed(verificationRecord);
        return verificationRecord;
    }

    /**
     * A verifier provides a signed hash of a verification result it 
     * has created for a subject address. This function recreates the hash 
     * given the result artifacts and then uses it and the signature to recover 
     * the public address of the signer. If that address is a trusted verifier's 
     * signing address, and the assessment completes within the deadline (unix time in 
     * seconds since epoch), then the verification succeeds and is valid until revocation,
     * expiration, or removal from storage.
     */
    function _validateVerificationResult(
        VerificationResult memory verificationResult, 
        bytes memory signature
    ) internal view returns(VerificationRecord memory) {

        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
          keccak256("VerificationResult(string schema,address subject,uint256 expiration,bytes32 payload)"),
          keccak256(bytes(verificationResult.schema)),
          verificationResult.subject,
          verificationResult.expiration,
          verificationResult.payload
        )));
        
        // use OpenZeppelin ECDSA to recover the public address corresponding to the 
        // signature and regenerated hash
        address signerAddress = ECDSA.recover(digest, signature);
        
        address verifierAddress = _signers[signerAddress];

        require(
            _verifiers[verifierAddress].signer == signerAddress,
            "VerificationRegistry: Signed digest cannot be verified"
        );
        require(
            verificationResult.expiration > block.timestamp,
            "VerificationRegistry: Verification confirmation expired"
        );

        // create a VerificationRecord
        VerificationRecord memory verificationRecord = VerificationRecord({
            uuid: 0,
            verifier: verifierAddress,
            subject: verificationResult.subject,
            entryTime: block.timestamp,
            expirationTime: verificationResult.expiration,
            revoked: false
        });

        // generate a UUID for the record
        bytes32 uuid = _createVerificationRecordUUID(verificationRecord);
        verificationRecord.uuid = uuid;

        return verificationRecord;
    }

    function _persistVerificationRecord(VerificationRecord memory verificationRecord) internal {
        // persist the record count and the record itself, and map the record to verifier and subject
        _verificationRecordCount++;
        _verifications[verificationRecord.uuid] = verificationRecord;
        _verificationsForSubject[verificationRecord.subject].push(verificationRecord.uuid);
        _verificationsForVerifier[verificationRecord.verifier].push(verificationRecord.uuid);
    }

    /**
     * Generate a UUID for a VerificationRecord
     */
    function _createVerificationRecordUUID(VerificationRecord memory verificationRecord) private view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    verificationRecord.verifier,
                    verificationRecord.subject,
                    verificationRecord.entryTime,
                    verificationRecord.expirationTime,
                    _verificationRecordCount
                )
            );
    }
}
