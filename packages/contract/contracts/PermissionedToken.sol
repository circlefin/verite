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

// We import this library to be able to use console.log
import "hardhat/console.sol";

contract PermissionedToken is Ownable, ERC20 {

    address private verificationRegistryAddress;
    VerificationRegistry private verificationRegistry;

    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    function setRegistry(address account) external onlyOwner {
        verificationRegistryAddress = account;
        if (verificationRegistryAddress != address(0)) {
            verificationRegistry = VerificationRegistry(verificationRegistryAddress);
        }
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal virtual override
    {
        super._beforeTokenTransfer(from, to, amount);
        if (verificationRegistryAddress != address(0)) {
            // if the registry was always present, then the sender will always have been permissioned
            // because otherwise the account never could have received, but since the registry
            // may be removed by the Owner, we check the sender as well as receiver in this example
            require(_validCounterparty(from), "PermissionedToken: Invalid Sender");
            require(_validCounterparty(to), "PermissionedToken: Invalid Recipient");
        }
    }

    function _validCounterparty(address account) private view returns (bool) {
        // the Token could retrieve the verifications and filter based on
        // rules it applies regarding which records are acceptable, but in
        // this example, the Token merely tests for the presence of any valid
        // non-revoked non-expired verification record
        return verificationRegistry.isVerified(account);
    }

}
