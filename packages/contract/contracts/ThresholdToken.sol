/**
 * SPDX-License-Identifier: MIT
 *
 * Copyright (c) 2023 Circle Internet Financial Limited
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

    /**
     * @dev This hook executes as part of the ERC20 transfer implementation. In this
     * example, it ensures that the amount transferred is either below a demo
     * threshold, or that the caller has been verified. If those conditions are
     * not met, then the error will cause the demo Dapp to start verification and
     * will subsequently call validateAndTransfer, using the subject-submitted
     * VerificationResult path.
     *
     * See PermissionedToken.sol for an alternative to this example that uses
     * verfier-submitted results and delegation rather than inheritance.
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal virtual override
    {
        super._beforeTokenTransfer(from, to, amount);
        if (owner() != msg.sender) {
            require(amount < _credentialThreshold || this.isVerified(from),
                "ThresholdToken: Transfers of this amount require sender verification");
        }
    }

    /**
     * @dev A function to confirm a credential and transact in the same transaction.
     */
    function validateAndTransfer(
        address to,
        uint256 amount,
        VerificationResult memory verificationResult,
        bytes memory signature
    ) public {
        if (!this.isVerified(msg.sender)) {
            _registerVerificationBySubject(verificationResult, signature);
        }
        super.transfer(to, amount);
    }

    /**
     * @dev Convenience methods to get/set the threshold over which verification
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
