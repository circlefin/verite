---
sidebar_label: Issuance
sidebar_position: 2
---

# Issue a Verifiable Credential

_This tutorial will walk you through issuing verifiable credentials using the verite sdks. For additional context, see [Issuance Flow](/patterns/issuance-flow.md). A complete example of building an issuer is available at our [demo-issuer](https://github.com/centrehq/verite/packages/demo-issuer) demo._

For the sake of this demo, we will be using Decentralized Identifiers (DIDs) to identify the issuer (you) and subject (the person or entity the credential is about), as well as JSON Web Tokens (JWTs) as the means of signing and verifying the credentials. In practice, you are not limited to using DIDs to prove ownership; anything with a public/private key pair is a valid owner. Likewise, you do not need to use JWTs.

## Prerequisites: Issuer Setup

[See issuer setup instructions](/docs/developers/issuer-setup).

## Step 1: Create a DID for your issuer

In order to issue a credential, you must have some way of identifying yourself as an Issuer. This allows the credential to be "verifiable" by a 3rd party.

To start, you should create a DID keypair.

```ts
import { randomDidKey } from "verite"

const issuerDidKey = randomDidKey()
```

That keypair should look like the following:

```ts
{
  id: 'did:key:z6Mkf2wKCqtkNcKB9kRdHnEjieCLJPSfgwuR19fxBhioAwR7#z6Mkf2wKCqtkNcKB9kRdHnEjieCLJPSfgwuR19fxBhioAwR7',
  controller: 'did:key:z6Mkf2wKCqtkNcKB9kRdHnEjieCLJPSfgwuR19fxBhioAwR7',
  publicKey: Uint8Array(32) [...],
  privateKey: Uint8Array(64) [...]
}
```

Keep this keypair safe. You will be using this to sign all Verifiable Credentials. If you lose a keypair, you won’t be able to sign future credentials with the same key, and may temporarily lose the ability for verifiers to verify your credentials.

### Optional step: Use did:web

In order to leverage trust already established by your domain name, you can expose your did:key (created above) on your domain via the [did:web](https://w3c-ccg.github.io/did-method-web/) method and use that as reference.

For example, instead of listing the issuer of your VCs as `did:key:z6Mkf2wKCqtkNcKB9kRdHnEjieCLJPSfgwuR19fxBhioAwR7`, you could issue your VCs from `did:web:example.com`.

To do this, you need to create a `.well-known/did.json` file on your domain, which will allow did resolvers to find your public keys. An added benefit of did:web is that it will allow you to rotate your keys at your desire.

We won’t go into the specifics in this article, but you can read more [here](https://w3c-ccg.github.io/did-method-web/).

## Step 2: Receive a subject’s (end-user) DID

In order to issue a Verifiable Credential, you must know where to issue the credential. This can be a subject’s DID or any other public key (such as an ethereum address, etc). In this case, we’ll continue using DIDs.

Generally, you would follow the [Presentation Exchange (PEx)](https://identity.foundation/presentation-exchange/) flow as a means of allowing the subject to submit their DID as well as a request for a specific type of VC.

To do so, you need to create a [Credential Manifest](https://identity.foundation/credential-manifest/) showcasing what attestations you offer as Verifiable Credentials. In this example, we will offer a "Know Your Customer, Anti-Money Laundering" attestation (KYC/AML Attestation), meaning we are compliant with US regulations and have checked your account to determined you are not a bad actor. The benefit of this type of VC is that another service can be compliant with regulations without any personal information exposed in the VC.

```ts
import { buildKycAmlManifest } from "verite"

const manifest = buildKycAmlManifest({ id: issuerDidKey.controller })
```

This manifest contains instructions for the subject to use to request a VC.

The subject uses that manifest to build a “Credential Application”, which serves as a request for a VC. For example, a subject could create the application as such:

```ts
import { randomDidKey, buildCredentialApplication } from "verite"

// The subject needs a did:key, generate a random one:
const subjectDidKey = randomDidKey()

const application = await buildCredentialApplication(subject, manifest)
```

## Step 3: Issue the Verifiable Credential

Once the subject has requested a VC and submitted their DID (as part of their credential application), the Issuer can create a VC.

For our example, we're building a VC containing a KYC/AML Attestation. This attestation is quite simple in Verite. It defines an authority which has performed proper KYC/AML checks on the subject (in this example the authority is Verite, with the DID of `did:web:verite.id`).

We transport Verifiable Credentials using a Verifiable Presentation. The presentation is just a way of transferring credentials, with the benefit that the presentation creator does not need to be the credential issuer or subject.

Putting this together, we can do the following:

```ts
import {
  buildAndSignFulfillment,
  decodeCredentialApplication,
  buildIssuer,
  KYCAMLAttestation
} from "verite"

const decodedApplication = await decodeCredentialApplication(application)

const attestation: KYCAMLAttestation = {
  "@type": "KYCAMLAttestation",
  process: "https://verite.id/schemas/definitions/1.0.0/kycaml/usa",
  approvalDate: new Date().toISOString()
}

const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)

const presentation = await buildAndSignFulfillment(
  issuer,
  decodedApplication,
  attestation
)
```

The subject can then decode the presentation and store their Verifiable Credential for future use.

🎉 That’s it. You have now issued a Verifiable Credential.

You can view this demo as a full working example in our [demo-issuer](https://github.com/centrehq/verite/tree/main/packages/demo-issuer) demo.
