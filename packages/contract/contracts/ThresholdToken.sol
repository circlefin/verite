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

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./VerificationRegistry.sol";
import "hardhat/console.sol";

contract ThresholdToken is ERC20, VerificationRegistry {

    uint256 private _credentialThreshold = 10;

    constructor(uint256 initialSupply) ERC20("Threshold Example Coin", "THUSD") {
        _mint(msg.sender, initialSupply);
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal virtual override
    {
        super._beforeTokenTransfer(from, to, amount);
        if (owner() != msg.sender) {
            bool isSenderVerified = this.isVerified(from);
            require(isSenderVerified || amount < _credentialThreshold, 
                "ThresholdToken: Transfers of this amount require sender verification");
            // for the sake of demonstration, we're removing verifications
            // and requiring them again for new transfers
            if (isSenderVerified) {
                this.removeVerification(this.getVerificationsForSubject(msg.sender)[0].uuid);
            }
        }
    }
    
    /**
     * A function to confirm a credential and transact in the same transaction.
     */
    function validateAndTransfer(
        address to,
        uint256 amount,
        VerificationResult memory verificationResult,
        bytes memory signature
    ) public {
        registerVerificationBySubject(verificationResult, signature);
        super.transfer(to, amount);
    }

    /**
     * Convenience method to return the threshold over which verification
     * is required. This is an overly-simplified example, in the real world
     * more sophisticated logic would likely trigger verification.
     */
    function getThreshold() external view returns (uint256) {
        return _credentialThreshold;
    }

    function setThreshold(uint256 t) external onlyOwner {
        _credentialThreshold = t;
    }
}
