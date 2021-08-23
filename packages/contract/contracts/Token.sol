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

import "./VerificationValidator.sol";

// We import this library to be able to use console.log
import "hardhat/console.sol";

contract Token is VerificationValidator {

    string public name = "Verity Demo USDC";
    string public symbol = "VUSDC";

    uint256 public totalSupply = 1000000;

    mapping(address => uint256) balances;

    uint256 private immutable _CREDENTIAL_THRESHOLD;

    event Transfer(address indexed from, address indexed to, uint amount);

    constructor() {
        // The totalSupply is assigned to transaction sender, which is the account
        // that is deploying the contract.
        balances[msg.sender] = totalSupply;
        _CREDENTIAL_THRESHOLD = 10;
    }

    /**
     * A function to transfer tokens.
     */
    function transfer(address to, uint256 amount) external {
        require(balances[msg.sender] >= amount, "Not enough tokens");
        require(amount < _CREDENTIAL_THRESHOLD, "Verifiable Credential: Transfers of this amount require validateAndTransfer");

        _transfer(to, amount);
    }

    /**
     * A function to confirm a credential and transact in the same transaction.
     */
    function validateAndTransfer(
        address to,
        uint256 amount,
        KYCVerificationInfo memory verificationInfo,
        bytes memory signature
    ) public {
        require(balances[msg.sender] >= amount, "Not enough tokens");

        // Ensure that this caller has a valid verification
        validateKYCVerification(
            verificationInfo,
            signature
        );

        // After verification confirmed, transfer
        _transfer(to, amount);
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function verificationThreshold() external view returns (uint256) {
        return _CREDENTIAL_THRESHOLD;
    }

    function _transfer(address to, uint256 amount) private {
        balances[msg.sender] -= amount;
        balances[to] += amount;

        emit Transfer(msg.sender, to, amount);
    }
}
