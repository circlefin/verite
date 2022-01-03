---
sidebar_label: "Creating a Registry Contract in Solidity"
sidebar_position: 4
---
# Creating a Registry Contract in Solidity

When using the [smart contract pattern](../patterns/smart-contract-verity.md) for verifications, you can use any blockchain you would like. For the sake of this guide, we will focus on [Solidity](https://docs.soliditylang.org/en/v0.8.11/), which is the programming language for the Ethereum Virtual Machine.

## Setup

For this tutorial, we will use Hardhat. Hardhat provides tooling to set up your development environment, test contract code, deploy contracts, and more. [Follow this guide to get started with Hardhat](https://hardhat.org/tutorial/setting-up-the-environment.html).

Once your Hardhat project is set up, it's time to create our registry contract. In the contracts folder.

## Creating The Contract

In the `contracts` folder, create a new file called `VerificationRegistry.sol`. In that file, we want to specify the version of Solidity we're using. We're going to be using OpenZeppelin contracts soon, so we need to make sure our contract uses the same Solidity version as OpenZeppelin, which is currently `0.8.0`. A the top of your file add:

```
pragma solidity ^0.8.0;
```

Now, before we move on, let's install [OpenZeppelin's library of contracts](https://openzeppelin.com/). This will allow us to pull in dependent contracts that are safe and audited without us having to write them ourselves. To install, run the following:

`npm install @openzeppelin/contracts`

Once the dependencies are installed, we can import the appropriate libraries into our contract. Let's take a second to understand what those libraries are.

The first library we will import into our contract is the `Ownable` library. This one is designed to make it easier to lock function calls down to the owner of the contract.

The next library we will import is `ECDSA` library. This library is used to help us decode signed and hashed data.

Finally, we will import the `EIP712` library. This is the most important library in our contract since it is foundational to how we will verify credentials. For more on this, be sure to reference the [Smart Contract Patterns section](../patterns/smart-contract-verity.md).

To import these libraries, add the following below the Solidity version in our contract:

```
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
```

There's one additional library we want to import. This one is an interface library that allows us to more easily map the types necessary in our contract variables and functions. For brevity, we're not going to write the interface itself. We'll just copy it from the existing example from Centre. You can [grab a copy of the interface library contract here](https://github.com/centrehq/demo-site/blob/main/packages/contract/contracts/IVerificationRegistry.sol).

Create a new contract file in your `contracts` folder and called it `IVerificationRegistry.sol`. Paste the contents of the example file linked above into that contract, then return to your `VerificationRegistry.sol` file.

Add one more import to the Verification Registry contract:

```
import "./IVerificationRegistry.sol";
```

Now, we're ready to write the contract!

# State Variables

Our Verification Registry requires some contract state. If you remember from the Smart Contract Patterns part of the documentation, this means either a verifier or a subject will have to pay gas to update the state of the contract when a new verification is added to the registry.

Let's go ahead and start creating the contract and add in some variables. First, we need to define the contract itself. We do that like so:

```
contract VerificationRegistry is Ownable, EIP712("VerificationRegistry", "1.0"), IVerificationRegistry {

}
```

There are a couple of interesting things going on already. First, we are using the EIP712 library to help us with signature validation and hashing. When we use that library, it requires two parameters: a name and a version.

Next, we are extending our contract to use the types defined in our interface contract.

Ok, now let's define some variables. We'll drop them all below and then we'll talk through each.

```
// Verifier addresses mapped to metadata (VerifierInfo) about the Verifiers.
mapping(address => VerifierInfo) private _verifiers;

// Verifier signing keys mapped to verifier addresses
mapping(address => address) private _signers;

// Total number of active registered verifiers
uint256 _verifierCount;

// All verification records keyed by their uuids
mapping(bytes32 => VerificationRecord) private _verifications;

// Verifications mapped to subject addresses (those who receive verifications)
mapping(address => bytes32[]) private _verificationsForSubject;

// Verfications issued by a given trusted verifier (those who execute verifications)
mapping(address => bytes32[]) private _verificationsForVerifier;

// Total verifications registered (mapping keys not being enumerable, countable, etc)
uint256 private _verificationRecordCount;
```

The comments above each variable help explain what their purpose is, but we'll walk through it here as well.

The `_verifiers` variable is a mapping of information tied to verifiers. If we look at the `IVerificationRegistry.sol` file, we can see the `VerifierInfo` type looks like this:

```
struct VerifierInfo {
    bytes32 name;
    string did;
    string url;
    address signer;
}
```

We won't copy over every type into this tutorial, but this shows how you can see the shape of the expected data for various variables.

The next variable we have is `_signers`. This is a mapping of the keys verifiers use to sign the verification records. It's how the Verification Registry contract can validate the verifier is who they say they are.

Next, we have a simple count to help track the number of verifiers: `_verifierCount`.

```solidity
uint256 _verifierCount;
```

We, of course, have to track the actual verifications as well. That is done in the mapping called `_verifications`.

```solidity
mapping(bytes32 => VerificationRecord) private _verifications;
```

In this example, we are mapping the verification identifier (a UUID) to the verification record. You may want to customize this mapping to your specification, but UUIDs are relatively collision resistant and tend to be good unique identifiers for things like this.

Next, we have the mapping of verifications for a specific subject:

```
mapping(address => bytes32[]) private _verificationsForSubject;
```

This mapping requires the subject's wallet address and then maps it to an array of UUIDs.

Similarly, we track the verifications for verifiers with:

```
mapping(address => bytes32[]) private _verificationsForVerifier;
```

And finally, we have a simple count for total verifications:

```
uint256 private _verificationRecordCount;
```

Of course, the contract is nothing if it's just a bunch of state variables. Let's dive into writing the functions that will define the contract.

# Contract Functions

The first function we'll define is to add a verifier. Without a verifier, the registry doesn't work. This function should look like this:

```
function addVerifier(address verifierAddress, VerifierInfo memory verifierInfo) external override onlyOwner {
    require(_verifiers[verifierAddress].name == 0, "VerificationRegistry: Verifier Address Exists");
    _verifiers[verifierAddress] = verifierInfo;
    _signers[verifierInfo.signer] = verifierAddress;
    _verifierCount++;
    emit VerifierAdded(verifierAddress, verifierInfo);
}
```

Many of the functions on this contract can only be called by the owner of the contract (the address that deployed it). This function is no exception. The `onlyOwner` modifer uses the OpenZeppelin Ownable library to add a check that ensures the function is being called by the contract owner.

The function takes a verifier's address and the verifier information structured as defined by the `VerifierInfo` type.

You'll notice the `emit` at the end of the function. We don't have any events defined on the `VerificationRegistry.sol` contract, but the example interface contract does. This is completely optional, but emitting events is a nice way to allow others to listen to those events and take some action.

The next function is a simple one that is available to anyone to call. It takes a wallet address and returns a boolean indicating whether the address is a verifier or not.

```
function isVerifier(address account) external override view returns (bool) {
    return _verifiers[account].name != 0;
}
```

The next function is equally simple. It is also callable by anyone, not just the contract owner. It returns the total number of registered verifiers:

```
function getVerifierCount() external override view returns(uint) {
    return _verifierCount;
}
```

We will also want to get information about specific verifiers—not just their wallet address, but their full `VerifierInfo` record. To do that, we can create the following function:

```
function getVerifier(address verifierAddress) external override view returns (VerifierInfo memory) {
    require(_verifiers[verifierAddress].name != 0, "VerificationRegistry: Unknown Verifier Address");
    return _verifiers[verifierAddress];
}
```

This function is another read-only function, and it can be called by anyone. It takes the verifier's wallet address and returns the full verifier info record.

Verifier info can change, so we need a function to update that information. This function can only be called by the contract owner, but it allows for such updates:

```
function updateVerifier(address verifierAddress, VerifierInfo memory verifierInfo) external override onlyOwner {
    require(_verifiers[verifierAddress].name != 0, "VerificationRegistry: Unknown Verifier Address");
    _verifiers[verifierAddress] = verifierInfo;
    _signers[verifierInfo.signer] = verifierAddress;
    emit VerifierUpdated(verifierAddress, verifierInfo);
}
```

This function is a complete overwrite, so even if only part of the `VerifierInfo` record is being updated, a whole new record has to be passed into the function.

This function also emits an event called `VerifierUpdated` that anyone can listen for.

As you might expect, we also need to be able to remove verifiers. Again, only the contract owner can call this function.

```
function removeVerifier(address verifierAddress) external override onlyOwner {
    require(_verifiers[verifierAddress].name != 0, "VerificationRegistry: Verifier Address Does Not Exist");
    delete _signers[_verifiers[verifierAddress].signer];
    delete _verifiers[verifierAddress];
    _verifierCount--;
    emit VerifierRemoved(verifierAddress);
}
```

This function takes the wallet address for the verifier and removes that verifier from the `_verifiers` mapping. It removes the signing address for the verifier and reduces the total `_verifierCount`.

We now move into some of the actual verification logic with our functions. The first function is a modifier that acts very much like the `onlyOwner` modifier mentioned before. This one is a modifier that checks if the function is called by a verifier.

```
modifier onlyVerifier() {
    require(
        _verifiers[msg.sender].name != 0,
        "VerificationRegistry: Caller is not a Verifier"
    );
    _;
}
```