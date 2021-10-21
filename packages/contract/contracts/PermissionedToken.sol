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
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./VerificationRegistry.sol";

contract PermissionedToken is Ownable, ERC20 {

    // this token uses a VerificationRegistry for KYC verifications
    // additional registries for other types of credentials could also be used
    address private kycRegistryAddress;
    VerificationRegistry private kycRegistry;

    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    function setVerificationRegistry(address registryAddress) external onlyOwner {
        kycRegistryAddress = registryAddress;
        if (kycRegistryAddress != address(0)) {
            kycRegistry = VerificationRegistry(kycRegistryAddress);
        }
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal virtual override
    {
        super._beforeTokenTransfer(from, to, amount);
        if (kycRegistryAddress != address(0)) {
            // if the registry was always present, then the sender will always have been permissioned
            // because otherwise the registryAddress never could have received, but since the registry
            // may be removed by the Owner, we check the sender as well as receiver in this example
            require(_validCounterparty(from), "PermissionedToken: Sender is not verified");
            require(_validCounterparty(to), "PermissionedToken: Recipient in not verified");
        }
    }

    function _validCounterparty(address registryAddress) private view returns (bool) {
        // the Token could retrieve the verifications and filter based on
        // rules it applies regarding which records are acceptable, but in
        // this example, the Token merely tests for the presence of any valid
        // non-revoked non-expired verification record
        return kycRegistry.isVerified(registryAddress);
    }

}
