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

We already know that the mint function isn't going to work as it stands. We don't want just anyone to mint whenever they want. We want to allow people on the allowlist to mint first. Then, the mint function can be available when the `PUBLICSALE` variable is true. Let's make some changes first to the mint function:

```solidity
function mint(address addr, uint256 quantity)
    public
    payable
{
    require(PUBLICSALE == true, "Public sale not active");
    require(totalSupply() <= MAX_SUPPLY, "Would exceed max supply");
    require(msg.value >= PRICE, "insufficient funds");
    for (uint256 i = 0; i < quantity; i++) {
        uint256 tokenId = totalSupply() + 1;
        _safeMint(addr, tokenId);
    }
}
```

This was a simple change to make sure that the mint function could only be called if the public sale is toggled on. But we should also write a function to handle the presale for allowlist members. Above the mint function, add the following:

```solidity
function mintAllowList(
    uint256 quantity,
    AllowList memory dataToVerify,
    bytes memory signature
) external payable {
    require(PRESALE == true, "Presale sale not active");
    require(totalSupply() <= MAX_SUPPLY, "Would exceed max supply");
    require(msg.value >= PRICE, "insufficient funds");
    require(_verifySignature(dataToVerify, signature), "Invalid signature");
    for (uint256 i = 0; i < quantity; i++) {
        uint256 tokenId = totalSupply() + 1;
        _safeMint(addr, tokenId);
    }
}
```

OK, our new function is pretty close to the mint function with some important differences. First, the parameters expected to be passed into the `mintAllowList` function includes a data payload that we will define soon (`dataToVerify`) and a signature. The function takes the data to verify and the signature and passes it to a function we have yet to write called `_verifySignature`. If all our checks pass, the person is allowed to mint.

One thing to note is that this function does not include a max quantity per transaction or per allowlist participant. Most NFT projects will add a limit here to ensure the entire mint is not exhausted during presale. That's outside the scope of this tutorial.

Before we write the new function to verify the signature, let's talk about this `dataToVerify` payload and its struct `AllowList`. We will be using [EIP-712](https://eips.ethereum.org/EIPS/eip-712) to verify the signature passed through. This standard requires a well-defined payload. In our case, we just need to verify that the address passed through to us matches the address of the person calling the `mintAllowList` function and that the signature is valid.

At the top of your contract, above the constuctor, add the following:

```solidity
struct AllowList {
    address allow; // address of the subject of the verification
}
```

In order to use the EIP-712 standard, we need to import another library from OpenZeppelin. At the top of your file, add this line:

```solidity
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
```

And change the contract struct to open with this:

```solidity
contract AllowNFT is ERC721Enumerable, Ownable, EIP712("AllowList", "1.0") { ...
```

This tells the smart contract code that we are using the EIP-712 standard and defines our data payload as `AllowList`.

Now, we can write our `_verifySignature` function. Below the `mint` function, add the following:

```solidity
function _verifySignature(
    AllowList memory dataToVerify,
    bytes memory signature
) internal view returns(bool) {
    bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
      keccak256("AllowList(address allow)"),
      dataToVerify.allow
    )));

    address signerAddress = ECDSA.recover(digest, signature);
    require(CONTRACT_OWNER == signerAddress, "Invalid signature");
    return true;
}
```

This function takes in the `dataToVerify` payload and the signature. It then creates a digest using the function `_hashTypedDataV4` which we get by importing the EIP712.sol contract from earlier. We can then recover the address of the signer (the wallet that created the signature that was passed to the smart contract function) using the `ECDSA.recover` method. This, again, is provided to us through the EIP712.sol contract we imported.

Something important to note and not entirely obvious yet is that we are not verifying the signature is from the person calling the smart contract's `mintAllowList` function. Instead, we are verifying the signature matches the "issuer" of the allowlist membership. For simplicity, we are going to assume only the contract owner can add people to the allowlist. So we are checking that the recovered address from the signature matches the contract owner address. If so, the person is allowed to mint during the presale.

That was a lot, but this will start to make more sense once we connect the whole process together.

### Creating The Issuer And Minting App

To help illustrate how this all works together, we will need to create a simple web app where someone can go to request an allowlist spot. If approved, then they will be issued a Verifiable Credential indicating they are on the project's allowlist. That credential is what will then be presented to the smart contract.

We're going to use [Next.js](https://nextjs.org/) for this part of the tutorial. Next.js is a sever-side rendering framework that includes serverless functions for our backend. It's a nice, all-in-one package. Be sure to follow the [getting started guide](https://nextjs.org/docs/getting-started) to make sure you have all the necessary dependencies and the right versions of those dependencies.

In a new terminal window, let's create our new Next.js project. Run the following command from a different directory than the one that houses your smart contract:

`npx create-next-app minting-issuer`

Once the install and creation process is complete, you'll need to change into your project directory:

`cd minting-issuer`

Let's install the Verite library by running:

`npm i verite`

This will give us access to all the tools we need to build a credential application, issue credentials, and verify those credentials. We can start making use of this library by building out our first API route. I'm not going to go into deep detail about how Next.js handles API routing and serverless functions. [You read up on that here](https://nextjs.org/docs/api-routes/dynamic-api-routes). Just know that any routes we want to create should be placed in the `pages/api` folder.

In that folder, create a file called `manifest.js`. In that file, add the following:

```js
import { buildKycAmlManifest, randomDidKey } from "verite"
import { randomBytes } from "crypto"

export default function handler(req, res) {
  if (req.method === "GET") {
    try {
      //  We would normally have the key info stored as environment variables rather than generating on the fly
      const issuerDidKey = randomDidKey(randomBytes)
      const manifest = buildKycAmlManifest({ id: issuerDidKey.controller })
      res.json(manifest)
    } catch (error) {
      console.log(error)
    }
  }
}
```

Since the Verite library provides so much out of the box, it may be helpful to take a dive into the full documentation to understand everything, but what we have here is a manifest file being created that represents the type of verifiable credential to issue. For simplicity, we're using a KYC/AML manifest since it closely matches our use case (we're verifying a person for an allowlist spot). Once the manifest is built, we return it to the client for use in the next step.

Before we start building anything on the client, let's continue on our API routes. The manifest will be used by the client to send an application for the credential. So, let's create an API route that can handle that application. In the `pages/api` folder, create a new file called `application.js`. Then fill it with this:

```js
import {
  randomDidKey,
  decodeCredentialApplication,
  buildIssuer,
  buildAndSignFulfillment,
  buildCredentialApplication,
  buildKycAmlManifest
} from "verite"
import { randomBytes } from "crypto"
import { verifyMessage } from "ethers/lib/utils"
import { withIronSession } from "next-iron-session"
import { v4 as uuidv4 } from "uuid"

const allowedAddresses = [
  {
    wallet: "0xAddressYouWantToAddToAllowList",
    keypair: {} //  This will be created by verite soon
  }
]

const canReceiveAllowlistSpot = (address) => {
  if (allowedAddresses.find((a) => a.wallet === address)) {
    return true
  }
}

const getDelegatedKey = async (address) => {
  //  Check for existing key
  let keyPairOnAllowlist = allowedAddresses.find((a) => a.wallet === address)
  if (!keyPairOnAllowlist) {
    const newKeypairObj = {
      wallet: address,
      keypair: randomDidKey(randomBytes)
    }

    allowedAddresses.push(newKeypairObj)
    keyPaidOnAllowlist = newKeypaidObj
  }

  return keyPairOnAllowlist
}

const validApplicant = async (signature, message) => {
  const fullMessage = `Verify your wallet address. Message id: ${message.id}`
  const recoveredAddress = verifyMessage(fullMessage, signature)
  if (canReceiveAllowlistSpot(recoveredAddress)) {
    const delegatedKey = await getDelegatedKey(recoveredAddress)
    return {
      recoveredAddress,
      delegatedKey
    }
  }

  return null
}

function withSession(handler) {
  return withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD,
    cookieName: "web3-auth-session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production" ? true : false
    }
  })
}

export default withSession(async (req, res) => {
  if (req.method === "POST") {
    try {
      const message = req.session.get("message-session")
      const verified = await validApplicant(
        JSON.parse(req.body).signature,
        message
      )
      if (!verified) {
        return res
          .status(401)
          .send("Not qualified for allowlist or invalid signature")
      }
      const issuerDidKey = randomDidKey(randomBytes)
      const manifest = buildKycAmlManifest({ id: issuerDidKey.controller })

      //  Build application
      const application = await buildCredentialApplication(subject, manifest)
      const decodedApplication = await decodeCredentialApplication(application)

      if (!valid) {
        return res.status(401).send("Not eleigible for allowlist")
      }

      const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
      const attestation = {
        type: "KYCAMLAttestation",
        process: "https://verite.id/definitions/processes/kycaml/0.0.1/usa",
        approvalDate: new Date().toISOString()
      }
      const presentation = await buildAndSignFulfillment(
        issuer,
        decodedApplication,
        attestation
      )
      res.json({ presentation })
    } catch (error) {
      console.log(error)
      res.status(500).send("Server error")
    }
  } else {
    try {
      const message = { id: uuidv4() }
      req.session.set("message-session", message)
      await req.session.save()
      return res.json(message)
    } catch (error) {
      console.log(error)
      const { response: fetchResponse } = error
      return res.status(fetchResponse?.status || 500).json(error.data)
    }
  }
})
```

On the client side, we will need to build a credential application using the manifest we received on the last API call. We'll do that soon. But let's look at what the API request looks like when we have that application built. We would make a GET request to the `api/application` endpoint. Since the application itself will be a JWT, we can pass this in as a request header called `application`.

On the server side, we will decode the application using Verite's tools. We will then need to look up the applicant to verify they should be allowed on the allowlist. If not, we reject the request with a 401. If so, we build the verifiable credential and verifiable presentation then return that to the client.

Before we move on, let's write a placeholder function to look up and verify the applicant. In a production application, you would probably use a database or some other tool for tracking who should be on the allowlist. For this tutorial, I'm just going to use an array of wallet addresses. At the top of your `application.js` file, above the request function, add this:

```js
const validApplicants = ["0x..."]

const validApplicant = (application) => {
  if (validApplicants.includes(application.allowListAddress)) {
    return true
  }

  return false
}
```

Pretty simple check, but you can extend this to check from a DB or from a local file or wherever you'd like to check.

Let's start building our frontend now.

### Working On The Minting and Issuing Client

We now need to create a page in our web app that allows a user to request the allowlist verifiable credential. We will also need to build the minting functionality, but let's start with requesting the verifiable credential.

A couple of caveats to note here:

1. Because we are not asking people to maintain a separate verifiable credential wallet, we will be maintaining keypairs for each allowlist recipient. This is sufficient for our use case, but for other use cases, giving the end user full control over the delegated keypair may be necessary. In that case, you'd need to construct a key storage mechanism for the user. These keypairs are only for use when requesting and verifying credentials. So, they pose no risk of fund loss. They are completely separate from the cryptocurrency wallet private keys people maintain themselves.
2. When an allowlist participant presents their verifiable crendential, we will need to ensure that the wallet maps to the delegated key and we will need to use that key in the presentation and verification process.

How you add people to the list of allowlist participants and how you retrieve that list is outside the scope of this tutorial. You can use centralized storage solutions like S3, but if you choose to use a decentralized and public option like IPFS, just ensure you are encrypting the data since this will include the person's wallet address AND the delegated key we create.

For the tutorial, I will demonstrate with one approved wallet. We're going to hard-code our list of approved wallets, so we first need to get the wallet address and then generate a keypair for that wallet. You would do this for each wallet you add to the list.

Fortunately, Verite makes the key-gen easy.

Now that we have that out of the way, open up the `pages/index.js` file. Then add the following:

```js
import { useState, useEffect } from "react"
import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { randomDidKey, buildCredentialApplication } from "verite"
import { randomBytes } from "crypto"

export default function Home() {
  const [view, setView] = useState("request")
  const [ethereum, setEthereum] = useState(null)

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      console.log("MetaMask is installed!")
      setEthereum(window.ethereum)
    }
    if (ethereum) {
      ethereum.request({ method: "eth_requestAccounts" })
    }
  }, [ethereum])

  const requestCredential = async () => {
    try {
      const messageToSign = await fetch("/api/application")
      const messageData = await messageToSign.json()
      const accounts = await ethereum.request({ method: "eth_requestAccounts" })
      const account = accounts[0]
      const message = `Verify your wallet address. Message id: ${messageData.id}`
      const signature = await ethereum.request({
        method: "personal_sign",
        params: [message, account, messageData.id]
      })
      const applicationRes = await fetch("/api/application", {
        method: "POST",
        body: JSON.stringify({ signature })
      })

      const response = await applicationRes.json()
      localStorage.setItem("allowlist-vc", JSON.stringify(response))
      alert("Allowlist credential saved to local storage!")
    } catch (error) {
      alert("You are not eligible for the allowlist")
    }
  }

  const Navigation = () => {
    return (
      <div>
        <button onClick={() => setView("request")}>Request Allowlist</button>
        <button onClick={() => setView("mint")}>Mint</button>
      </div>
    )
  }

  const renderView = () => {
    switch (view) {
      case "mint":
        return (
          <div>
            <Navigation />
            <h1>Mint now</h1>
            <button>Mint</button>
          </div>
        )
      case "request":
      default:
        return (
          <div>
            <Navigation />
            <h1>Request allow list access</h1>
            <button onClick={requestCredential}>Request</button>
          </div>
        )
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>NFT Allowlist and Mint</title>
        <meta name="description" content="NFT allowlist and mint" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {renderView()}
    </div>
  )
}
```

This is a simple, ugly, view that lets a user switch betwee a minting screen and a request screen where they can get their allowlist VC (if approved). The `requestCredential` function ultimately
