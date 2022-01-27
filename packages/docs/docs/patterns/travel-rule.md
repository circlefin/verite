---
sidebar_position: 7
---

# Travel Rule Implementations

The Verite open source examples include a demonstration of how exchanging verifiable credentials may be helpful in implementing a scalable mechanism for financial institutions to comply with Travel Rule regulations.

## About the Travel Rule

The "Travel Rule" refers to the [U.S. Bank Secrecy Act rule](https://www.sec.gov/about/offices/ocie/aml2007/fincen-advissu7.pdf) as well as guidance defined by the international [Financial Action Task Force (FATF) Recommendation 16](https://www.fatf-gafi.org/publications/fatfrecommendations/documents/guidance-rba-virtual-assets-2021.html). The Travel Rule requires Financial Institutions (FIs) and what FATF refers to as Virtual Asset Service Providers (VASPs) to exchange and analyze specific PII data about the originator and beneficiary of a given transaction when such a transaction exceeds a threshold of notional value (the threshold is 3000 USD value for the US BSA version and 1000 USD/EUR value for FATF version). The purpose of these regulations is to police financial crime such as money laundering, block terrorist financing, stop payments to sanctioned entities and countries, and support the reporting of suspicious activities.

Mapping Travel Rule requirements to blockchain transactions poses several challenges. One such problem is "discoverablility" -- knowing when a beneficiary/recipient address is managed by a financial institution and therefore when Travel Rule obligations exist, and furthermore how to contact the recipient institution to execute secure counterparty data exchange. At broadcast time, the originator of a blockchain transaction has no means of knowing whether a recipient address is custodied by a financial institution or VASP, and no means of directly contacting the owner or custodian of that address.

The crypto ecosystem has proposed many potential solutions to this problem: maintaining registries of known blockchain addresses mapped to VASP network endpoints, maintaining a network of VASP nodes which FIs can query/poll prior to transaction broadcasts, leveraging analytics services and tools that glean metadata about addresses, transacting only on permissioned networks or specific chains designed with different identity capabilities, introducing new identifier schemes for transacting customers, or a hybrid combination of these approaches.

Verite's example addresses these problems by bootstrapping verifiable credentials exchange using a decentralized mem pool pattern, mirroring the memory/transaction pool pattern that most blockchains use prior to updating their ledgers. This approach may be more scalable than registry and private network approaches and also more privacy-preserving and potentially more accurate than analytics approaches alone. Mem pools are effectively decentralized messaging architectures that allow nodes to publish and subscribe/observe messages in peer-to-peer fashion. In blockchains, the messages represent transactions; wallets publish to them and observers can then validate or mine them. Verite uses the same concept to broadcast a privacy-preserving message about the intent to broadcast a future transaction (without sharing its value) on a given chain.

## Discovery and Credentials Exchange Sequence

<img src="/img/docs/travel_rule.png" alt="Travel Rule" width="800"/>

### Part 1: Discovery and Proving Control of Blockchain Addresses

1. Alice, the originator, initiates a transfer with her financial institution, which operates a hosted crypto wallet on her behalf.
2. Alice's FI forms a message (referred to here as "M1"), containing:
   - Proof of control of the originating address (formatted as a Verifiable Credential)
   - Request for proof of control of the beneficiary address (formatted as a Presentation Request)
   - A secure callback URL endpoint for replies to the Presentation Request
3. Alice's FI publishes M1 to the decentralized mem pool.
4. Bob's financial institution observes M1 in the mem pool and determines that the recipient address is in its custody, and it verifies the originator's VC.
5. Bob's financial institution constructs message "M2" which is a VC proving control over the beneficiary address.
6. Bob's FI transmits M2 privately to Alice's FI using the callback URL specified in M1.
7. Alice's FI receives and verifies the VC in M2, leaving both Alice's FI and Bob's FI (a) certain that each controls the designated addresses and (b) with a private secure network connection established through the specified callback URL.

Before the transaction is broadcast, the sending and receiving FIs use the chain-agnostic mempool to publish and observe messages establishing and requesting proof of address control. These messages contain no customer data and no specific transaction data. Since the transaction amount is not included, observers are unable to determine information about the planned transaction other than its intended origin and destination (this is less information than is available in a typical mem pool, in which the actual monetary transaction is broadcast). This allows counterparty endpoints to find and connect to one another privately before exchanging counterparty information, and the proof of address credentials prevent other parties from spoofing the originator or beneficiary.

### Part 2: Exchange of Counterparty Credentials

1. If the transaction's value triggers the Travel Rule threshold, Alice's FI responds to Bob's FI by composing a private message "M3" containing:
   - Transaction amount
   - Alice's originating counterparty verifiable credential
   - Presentation Request for beneficiary counterparty credentials
2. Bob's FI receives M3 and verifies the originator counterparty verifiable credential, and then executes its internal compliance procedures.
3. Once Bob's FI clears the information, it generates message "M4" containing Bob's beneficiary counterparty verifiable credential.
4. Bob transmits M4 to the secure callback URL endpoint.
5. Alice's FI receives M4 and verifies Bob's beneficiary counterparty verifiable credential, and then executes its internal compliance procedures.
6. Once Alice's FI clears the information, it broadcasts the planned transaction to the appropriate blockchain's mem pool to execute the exchange of value.

If the transaction does not meet the threshold required for the Travel Rule, then Part 2 is not necessary and does not apply, as Alice's FI can simply broadcast the blockchain transaction. If the Travel Rule does apply, however, both financial institutions are able to exchange counterparty verifiable credentials over callback URLs that allow for private off-chain secure communication. Although traditional financial institutions typically have terms and conditions that grant the rights to transfer this private information, Verite's demonstration surfaces notifications as alerts to customers so that they have visibility into when their data is requested, and to provide them the choice to cancel sending or receiving transactions that require such counterparty credentials exchange.

## Future Development

Note that this sequence is intended only as a demonstration of how exchanging verifiable credentials may be helpful with Travel Rule requirements. Production-level topics such as mem pool spam prevention, multisignature counterparties, and private key security protections are beyond the current scope and are among several subjects to address in future development and exploration.
