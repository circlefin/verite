---
sidebar_label: Credential Lifecycle
sidebar_position: 3
---

# Credential Lifecycle

Verifiable Credentials allows flexible definition of credential lifecycles.

Two (optional) properties of a Verifiable Credential are used by verifiers when determining whether to accept a credential:

- `expirationDate`: optional ISO 8601 formatted string indicating when the credential is no longer valid [details](https://www.w3.org/TR/vc-data-model/#expiration)
- `credentialStatus`: property whose `type` property defines a method for determining credential status, such a way to determine whether the credential has been revoked or suspended [details](https://www.w3.org/TR/vc-data-model/#status)

During verification, `expirationDate` is evaluated and interpreted uniformly through comparison with the current date (possibly factoring in a delta), but `credentialStatus` must be evaluated based on the instructions indicated by the `type`. This might include instructions for looking up a list of revoked credential ids, identifying the status of a credential as an index in a bit vector, or use of a cryptographic accumulator. Verification libraries would typically allow for this flexibility through use of a status plugin model.

The choice of `credentialStatus` implementation allows for multiple credential states; i.e., a credential issuer might want to indicate a credential is "active", "suspended", or "revoked". However, most existing implementations are intended to support two states -- "active" and "revoked".

Verifiers may apply additional criteria to determine whether to accept a credential, such as their own fitness for purpose considerations.

## Expiration vs revocation

While expiration and revocation are semantically different, a combination of implementation considerations

Revocation does not always mean the credential subject has become ineligible for the given type of credential; sometimes it is used to correct information within the credential. Unless explicitly provided by the specific credential status implementation, a verifier is not intended to assume a reason for revocation. An issuer may provide a "revocation reason", but should be mindful of the possible privacy impact of the information provided.

Issuers or subjects may want to refresh or renew a credential for a variety of reasons: in addition to updating the data in the credential (a name change, for example), subjects may want to update their identifier if they have lost control of cryptographic keys and rotation/recovery is not possible. For reasons such as this, some issuers may set an `expirationDate` that precedes the actual ending validity of a credential. In this case, the issuer is recommended to specify a [refresh service](https://www.w3.org/TR/vc-data-model/#refreshing) via a `refreshService` field for convenience to the credential subject.

`expirationDate` is commonly used for purposes like a trade certification, or a license that must be renewed every year. But it is also useful for credentials that become out of date quickly, like a credit score.

## Privacy considerations

Verifiable credentials are generally recommended to be off-chain, but on-chain registries for credential status, are often an appealing implementation choice from a privacy perspective because they allow the issuer to update the status of a credential without a "phone home". When data is stored on-chain, it becomes especially important to consider privacy implications of the revocation implementation. It's discouraged to store personal data, which can even include correlatable identifiers. The VC Data Model's [privacy considerations](https://www.w3.org/TR/vc-data-model/#privacy-considerations) section contains pointers that are especially relevant to credential status implementations.
