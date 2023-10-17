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

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IVerificationRegistry.sol";

contract PermissionedToken is Ownable, ERC20 {

    /**
     * @dev This token uses a VerificationRegistry for KYC verifications.
     * Additional registries for other types of credentials could also be used.
     */
    address private kycRegistryAddress;
    IVerificationRegistry private kycRegistry;

    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev In this example, the contract owner can add, remove, and replace the registry
     * implementation that is used to manage verifications.
     */
    function setVerificationRegistry(address registryAddress) external onlyOwner {
        kycRegistryAddress = registryAddress;
        if (kycRegistryAddress != address(0)) {
            kycRegistry = IVerificationRegistry(kycRegistryAddress);
        }
    }

    /**
     * @dev This hook executes as part of the ERC20 transfer implementation. In this
     * example, it ensures that the sender and recipient are verified counterparties.
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal virtual override
    {
        super._beforeTokenTransfer(from, to, amount);
        if (kycRegistryAddress != address(0)) {
            require(_validCounterparty(from), "PermissionedToken: Sender is not verified");
            require(_validCounterparty(to), "PermissionedToken: Recipient is not verified");
        }
    }

    /**
     * @dev The Token could retrieve the verifications and filter based on
     * rules it applies regarding which records are acceptable, but in
     * this example, the Token merely tests for the presence of any valid
     * non-revoked non-expired verification record.
     */
    function _validCounterparty(address registryAddress) private view returns (bool) {
        return kycRegistry.isVerified(registryAddress);
    }

}
