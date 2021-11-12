---
sidebar_position: 7
---

# Travel Rule

The Verity open source includes a demonstration of how verifiable credentials can be used as part of an efficient, privacy-preserving protocol enabling custodied wallet providers to comply with counterparty regulatory obligations.

## Sequence

<img src="/img/docs/travel_rule.png" alt="Travel Rule" width="800"/>

### Part 1 - Proof of Control

1. The customer initiates a transfer with their hosted wallet
2. The hosted wallet forms a request (referred to as "R1"), containing:
   - Proof of control of the sending address (Verifiable Credential)
   - Request for proof of control of the receiver address (Presentation Request)
   - A Callback URL
3. The wallet notifies the customer that personal data will be shared and asks for consent
4. The wallet forwards R1 to a mempool monitored by other interested parties
5. The hosted wallet provider (on their behalf) observes the message for a recipient address under its control, verifies the sender VC, and constructs the receiver proof of control (R2)
6. Sends R2

TODO: link to schemas

### Part 1 Discussion

Before the transaction is broadcast, the sending and receiving wallet providers use the chain-agnostic mempool to publish and observe messages establishing and requesting proof of address control. These messages contain no customer data -- just the address with proof (not even the tx amount is included). This allows them to identify the correct counterparty and privately share, via the callback URL, customer data only after that party is established.

### Part 2 - Exchange of Counterparty Credentials

Once a matching set of providers found:

1. The sending wallet verifies the receiver's proof of ownership.
1. If the transaction amount is over $3,000 the sending wallet sends a request (R3), containing:
   - Transaction amount
   - Originating counterparty (Verifiable Credential)
   - Request for beneficiary counterparty credentials (Presentation Request)
1. The receiver's wallet:
   - Verifies the originators counterparty credential
   - Performs necessary AML
1. If approved, receiver sends beneficiary counterparty credentials (R4).
1. The sender's wallet:
   - Verifies the the beneficiary credential
   - Performs necessary AML
1. If approved, the sending wallet executes the transaction.

### Part 2 Discussion

If the transaction does not meet the threshold required for the Travel Rule, the sending wallet can execute the transaction. Otherwise, counterparty credentials must be exchanged. It is important to note that by this part, both wallet providers have exchanged callback URLs that allow for off-chain, private, and secure communication of relevant counterparty credentials.

## Additional Implementation Notes

- The receiving customer may receive the request through a push notification to their mobile device or in-browser (notified by an email or other alert).
- These credentials may be created in advance or dynamically
