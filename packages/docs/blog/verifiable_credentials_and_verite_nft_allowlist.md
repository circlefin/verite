---
title: How To Use Verifiable Credentials And Verite To Build An Off-Chain NFT Allowlist
description: NFT allowlists are expensive. The gas involved in creating and updating allowlists on Ethereum can be prohibitive. Fortunately, verifiable Credentials and Verite makes it easy and secure to run allowlists off-chain.
slug: NFT-allowlists-with-verifiable-credentials-and-verite
authors:
  - name: Justin Hunter
    title: Head of Product, Pinata
    url: https://github.com/polluterofminds
    image_url: https://avatars.githubusercontent.com/u/10519834?v=4
tags: [updates]
image: https://i.imgur.com/mErPwqL.png
hide_table_of_contents: false
---

While Verite can help solve significantly more complex challenges than managing an early access (allowlist) list for NFT projects, it seemed like a fun experiment to see how well Verite could handle moving the costly process off-chain while still maintaining data integrity. Before we dive in, let's talk about what an NFT allowlist is, how it is normally managed, and what the problems are.

### What is an Allowlist?

For many NFT projects, rewarding early supporters is important. An allowlist helps do so. By putting supporters' wallet address on a list that grants them early access to mint NFTs from the new collection, these supporters can avoid what's commonly referred to as [gas wars](https://www.coindesk.com/learn/what-are-crypto-gas-wars/). Gas wars happen when a popular NFT project drops and people (and bots) spend exorbitant amounts of gas on the Ethereum network to ensure their minting transactions go through before anyone else's. This, of course, negatively impacts all participants because it can price people out of the collection and force them to buy the NFTs on secondary market at a higher premium.

The allowlist concept lets people on the list mint for a period of time (normally 24 hours) before the public mint. This helps keep bots out of the mint, gaurnatees supply, and keeps gas prices relatively low. NFT projects will use allowlist spots as a reward for community participation.

### How Are Allowlists Normally Managed?

Historically, Ethereum-based NFT allowlists have been managed on-chain. This means a mapping of wallets addresses must be added on chain via a function on the NFT project's smart contract. The transaction to add these wallet addresses can be incredibly expensive. It can range from a few hundred dollars to a few thousand dollars depending on the price of ETH. This doesn't factor in multiple updates.

Because of the cost, projects are incentivized to set the allowlist and never update it. Every update costs money. This can lead to errors in the list, inequity, and other problems. Additionally, allowlists become static requirements—a one-size-fits-all approach. Services like Premint have begun to change this, but projects should have the flexibility to implement whatever dynamic requirements they'd like to add people to an allowlist on their own if they choose.

That's where Verifiable Credentials come in.

### How To Use Verite and Verifiable Credentials

We're going to be working through an Ethereum ERC-721 NFT contract alongside a mechanism that allows us to issue verifiable credentials to participants that we want to allow on the allowlist. We'll use Hardhat to help us generate the skeleton for our smart contract code and to make it easier to test and deploy.

On the front-end side of the house, we'll build a simple page that allows potential allowlist recipients to request their verifiable credential, and we'll build the actual minting functionality.

Let's get started. You'll need Node.js version 12 or above for this. You'll also need a good text editor and some knowledge of the command line.

From your command line, create a new project directory. You can name this whatever you want, but I'm going to call mine `vc-allowlist`:

```
mkdir vc-allowlist
```

Then, change into that directory:

```
cd vc-allowlist
```

We need to initialize a new Node.js project in this directory. To do so, run the following command:

```
npm init -y
```

Now, let's add hardhat's Node.js library as a dependency to our project:

```
npm i -D hardhat
```

Notice, we're using the `-D` flag. This is the same as saying `--save-dev`. It means we are installing hardhat as a development dependency. Any code compiled and deployed to a production server would not include the development dependencies.

We can now initialize a new hardhat project. We're going to use a template project and just edit it for convenience. Run the following:

```
npx hardhat
```

Choose the "Create a basic sample project" option. Say yes to all the prompts, and the project will be initialized with dependencies installed. If you open the project up in your text editor now, you'll see a lot has been done for you. You should see a `contracts` folder, a `scripts` folder, and a `test` folder among other things.

Hardhat gave us all the boilerplate we need to hit the ground running. Open up the `contracts` folder and let's get our smart contract updated.

**Writing The Contract**

You'll see the contract that came with the basic sample from hardhat is a simple hello, world contract. We're going to change this. First, change the name of the `Greeter.sol` file to `AllowNFT.sol`. Next, let's install [OpenZeppelin's smart contract library](https://openzeppelin.com). Back at the command line, in the root of the project, run:

```
npm install @openzeppelin/contracts
```

By installing OpenZeppelin's library, we get audited smart contracts we can use to extend our projects. I've created the base boilerplate for the NFT contract we'll use, so update your smart contract file to look like this:

```
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AllowNFT is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    string public BASE_URI;
    uint256 public MAX_SUPPLY = 10_000;
    uint public PRICE = 60000000000000000;
    bool public PRESALE = false;
    bool public PUBLICSALE = false;

    constructor(
        string memory baseURI,
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {
        BASE_URI = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return string(abi.encodePacked(BASE_URI, "/"));
    }

    function togglePreSale() onlyOwner public {
        PRESALE = !PRESALE;
    }

    function togglePublicSale() onlyOwner public {
        PUBLICSALE = !PUBLICSALE;
    }

    function mint(address addr, uint256 quantity)
        public
        payable
    {
        require(totalSupply() <= MAX_SUPPLY, "Would exceed max supply");
        require(msg.value >= PRICE, "insufficient funds");
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = totalSupply() + 1;
            _safeMint(addr, tokenId);
        }
    }
}
```
