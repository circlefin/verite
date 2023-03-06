---
title: Year in Review 2023
description: A Roadmap for a Cookbook
slug: year-in-review-2023
authors:
  - name: Juan Caballero
    title: Standards Coordinator, Centre.io (Verite)
    url: https://github.com/bumblefudge
    image_url: https://avatars.githubusercontent.com/u/37127325?v=4
tags: [governance, research, roadmap]
hide_table_of_contents: false
---

A year ago today, I started full-time working on Verite, coordinating research on my fronts and moving from prototype and "cookbook for an ecosystem" to production trials, compliance research, and use-case exploration. It's been a great year and we have a lot to be proud of-- but also a backlog of updates to the documentation, as the exploration has yielded iteration and variation, new frontiers and new constellations of design. This post will serve as a milestone report overviewing those discoveries, new research directions, and ongoing conversations.

## Compliant Membership

For all of this year, we remained laser-focused on one use-case: "membership proofs" that attest to a specific blockchain address being a member of a coarsely-defined "compliant pool" that has been checked to a minimal level, which reveal minimal identifiable data on-chain or on the open web. Delivering this value is what Verite was created to do, and all other use-cases we have been working on follow from it and build on it -- or, to put it another way, are unlikely to go to production until our primary use-case has users and traction, as "follow-on" products and "knock-on" network effects.

Our research uncovered much complexity and diversity among the on-chain **consumers** of these membership proofs, which leads us to support different variations and form-factors for this use case and the supporting technical work needed to go beyond mere membership. We found:

1. Some smart-contract-based consumers only wanted to consume membership proofs on-chain, making a strict "nothing on-chain" approach across all Verite architectures unworkable
2. Other smart-contract-based consumers want to outsource the enforcement of a compliance policy (usually roughly defined, and expected to be refined over time) to a single service, with an expectations of real-time monitoring and complete separation of concerns.
3. These services will need to retool as regulatory requirements and reliance frameworks evolve over time.
4. Everyone (even the services!) worries about centralization and silos forming -- the services want to be able to work with one another's end-users, and thus provide a larger (and more decentralized!) customer-base to their on-chain customers.

Our earlier research assumed on-chain activity could be gated by Verifiable Credential (or "off-chain soulbound tokens" as they are sometimes called in web3), but the further we delved into the "customer requirements" of on-chain platforms, the more it became apparent that it did not fit in their technical or business model to accept and validate verifiable credentials, with or without input towards the schematization of those policies into composable bits. They wanted a distinct service provider (#2) to handle that, and off-chain tokens would allow these service providers to federate their customer bases and interoperate (#4), as well as to evolve over time (#3). Their secret sauce and competition was best left to their relationships with on-chain customers, as well as their specific tooling and integration patterns (#1).

## Governance and Compliance

Another aspect that shifted substantially over the last year was the role of governance in the system. When the work began, without splitting on-chain relying parties from verification services, it was easier to imagine a simple feedback loop between relying parties and the schema design for the contents of the Verite credentials which would be issued and/or validated by verification services. But if verification services would be independent actors rather than implemented by and owned by the relying parties, the complexity of governance needed for this network was growing.

In particular, we worried that on-chain communication would be the hardest to align on given the business model pressures of this 4-actor model. While "schema design", as we had been calling it, sounded like a relatively simple technical question of data modeling, it turned out to be a far more complex beast across different chains of reliance and slight architectural variants.

For this reason, less schema design happened in Centre-hosted working groups than we had expected. As end-to-end products continue to evolve, this kind of alignment could perhaps be premature, and many Verite partners have opted to defer this kind of harmonization until after there is signification adoption and traction. The schemas published so far are adequate to geographically-limited launches of the initial use-case, and as the sphere of supported geographies and use-cases expands, or as more players enter the space and demand grows for federation and interoperability, we look forward to truly viable self-governance. In the meantime, we will continue technical research and design work.

Specifically, that falls in four categories:

1. On-chain Design
2. Architectural Design & Adoption
3. Technical Standardization
4. Additional Use-Cases

## Ongoing On-Chain Research

One of the most active groups Verite hosted over the last year was the On-Chain Best Practices group, which zoomed in on the "last mile" between the on-chain consumers relying on Verite to deliver it safe addresses, and the off-chain verifiers handling all the messy details and off-chain data with privacy and nuance. This group focused on the subtle difference (lost on many readers of the Verite documentation!) between **Verification Results** (verbose, identifying, necessarily off-chain and archival for reporting and legal reasons) and **Verification Records** (concise, anonymous, essentially just a log entry or a pointer to archival results documentation). Only the latter can go on-chain, and thus the latter needs to be enough for on-chain relying parties to act; the former, however, enables all the flexibility and nuance needed for a policy engine, a data translation layer, and a federation of competitors.

Surveying the landscape, a Verite research team and a few academic interlocutors cooperated on a synthetic comparison of architectures we saw for addressing the on-chain compliance problem space. The result was a [thorough lightpaper](https://github.com/WebOfTrustInfo/rwot11-the-hague/blob/master/draft-documents/onchain_identity_verification_flows.md) laying out where Verite fit in the broader landscape of on-chain identity with and without verifiable credentials. Zooming in even more on the relationship between on-chain consumers and identity-enabled on-chain tokens, Keith Kowal from the Hedera-focused research team at Swirld Labs wrote up another [useful primer](https://hedera.com/blog/the-rise-of-the-identity-token). It focuses in on where on-chain tokens do and don't fit the "soul-bound" model for a "decentralized society," as well as how on-chain artefacts can and cannot meet the requirements of compliance in today's jurisdiction-based and centralized society of laws.

As products launch and evolve in the marketplace, this group remains confident that alignment on incrementally more technologically prescriptive guidance will be valuable, leading to shared interfaces and shared security models as federations form. For this reason, Verite's most active working group plans to keep meeting and keep designing on-chain registries and smart contracts across multiple languages and blockchain environments. Look forward to additions to Verite's documentation along these lines in Q2 and Q3 of this year.

## Ongoing Architectural Design

The RWoT lightpaper linked above implicitly compared [the Verite architecture](https://github.com/WebOfTrustInfo/rwot11-the-hague/blob/master/draft-documents/onchain_identity_verification_flows.md#architecture-c-blinded-off-chain-proof-verified-on-chain) to simpler end-to-end products already active in the DeFi space today, but this comparison only works at a certain level of abstraction. Zooming in a bit, Verite has actually forked into two separate-but-equal architectures over the last year, and works hard to keep feature parity and use-case parity between the two.

The original Verite design assumed an end-user either using TWO wallets (an identity wallet and a crypto wallet), or a "fat wallet" controlling both a private and portable DID and one or more blockchain private keys). This defined our initial schemas, and the original Verite implementation guide imagines [multi-chain Crypto wallets adding support for a DID](https://verite.id/verite/developers/wallet-guide) in much the same way they handle adding support for a new blockchain or private-key type to be able to handle private, DID-based offchain VCs. This dual-wallet, both "SSI" (self-sovereign identity) and "Crypto", is a cornerstone of [the "Web5" approach](https://areweweb5yet.com/), allowing SSI for next-gen (and post-cookie!) Web2 use-cases, strong privacy and pseudonymity for web3 use-cases, and even a few carefully guard-railed bridges between the two. While we fully endorse this approach, we are waiting for more implementation interest and DeFi demand to further prototype technical artefacts for this architecture.

In the meantime, a simpler architectural pattern (outlined in detail in a [prior blog post](https://verite.id/blog/verification-patterns-1)) emerged in prototyping work with Circle Engineering: an [address-based credential](https://verite.id/verite/patterns/issuance-flow#address-bound-credential-issuance), issued not a DID controlled by a specific wallet client, but to an address (which might even be controlled from multiple wallet clients). This enables a different path to wallet support, piggybacking on the [WalletConnect version 2](https://medium.com/walletconnect/walletconnect-v2-0-protocol-whats-new-3243fa80d312) upgrade cycle to get wallets implementing lightweight, "minimum-viable" support for verifiable credentials _without_ the need to handle DID keys or complex VC-specific protocols.

In the coming months, expect to see the [Wallet Connect](https://verite.id/verite/developers/supporting-wallet-connect) instructions on the Verite documentation expanded and entries added to other pages as more wallets roll out support for Verite credentials via Wallet Connect rails. This is a major ongoing research topic with Circle and WalletConnect, testing the hypothesis that thin wallets want to stay thin just as much as dapps wants to stay ignorant of the identities of their users (even in compliant products).

## Ongoing Technical Standards Contribution

It bears repeating often that Verite is not a product or a solution, but rather a protype and a "cookbook" for overlapping DeFi ecosystems. While Centre strives to be a neutral convener of co-development between startups and major players, Centre is not a "standards organization" but encourages use-case alignment with subsequent development in appropriate standards organizations. Rather than design or specify them, Centre strives to integrate and socialize technologies. As such, a key design goal for Verite from the beginning was to invent as little new technology as possible and use standards-track building blocks wherever possible to maximize interoperability between competitors and sustainability of technical decisions, two crucial ingredients in any sustainable ecosystem.

For this reason, while Verite is not a product or a solution, it could be called a "protocol," aiming at adoption by wallets and dapps. Or to be more precise, Verite could be seen as a "profile" and sample implementation of the more general-purpose [Presentation Exchange](https://identity.foundation/presentation-exchange/) protocol for Verifiable Credentials. For this reason, Centre is committed to maintaining and iterating the Presentation Exchange specification at the [Decentralized Identity Foundation](https://identity.foundation/).

Of course, Verite relies on many other standards and open-source initiatives, to which it is also committed. The bedrock [W3C data model specification](https://www.w3.org/groups/wg/vc) on which all VC work depends is currently being iterated and Verite plans to take advantage of new features and improvements with time. The nuts and bolts of crypto-wallet adoption, off-chain VC presentation, and signing involves representing VC use-cases at the Chain-Agnostic Standards Alliance ([CASA](https://github.com/chainagnostic/casa/)).

## Ongoing Research Towards Other Use Cases

While the focus has always been on privacy-preserving exchange of off-chain credentials to enable on-chain reliance, lots of doors are opened by the adoption of Verite building blocks for other credentials. We've discussed:

- ["Travel Rule" use-cases](https://verite.id/verite/patterns/travel-rule) and the role of VCs in a more open-world version of today's VASP-to-VASP discovery and exchange protocols (led by Nota Bene)
- "Heavier" credentials expressing not just membership but actual personal information for cross-organization de-duplication or identification, or in its more complex formulation, "reusable on-boarding" and "portable identity verification"
- Identity assurance FOR verifiable credentials, leaning on existing web2 trust frameworks or "holder-binding" mechanisms for insuring the same actual person identified and onboarded is the same person presenting the credentials later, whether they be "membership" credentials or more high-stakes heavy ones
- Zero-knowledge mechanisms for generating IN THE WALLET a verification record that can be sent to an on-chain relying party, bringing us back to the fat-wallet, 3-party model
- Schemas for future use-cases, that might happen outside rather than inside Centre.io depending on the co-designers and their IP constraints

Each of these directions presents new possibilities and its own venues for future work, technological and otherwise. There are no timelines or commitments are in place, as howe each of these research directions pans out depends how the work done thus far finds its way to market and wallet adoption.
