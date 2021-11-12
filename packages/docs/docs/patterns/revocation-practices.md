---
sidebar_label: Revocation
sidebar_position: 4
---

# Revocation Practices

Verifiable Credentials allow a `credentialStatus` to define a [method for determining the credential's status](https://www.w3.org/TR/vc-data-model/#status), such as whether the credential has been revoked or suspended. The precise contents of a credential's status are determined by the specific type definition.

The choice of `credentialStatus` implementation allows for multiple credential states; i.e., a credential issuer might want to indicate a credential is "active", "suspended", or "revoked". However, most existing implementations are intended to support two states -- "active" and "revoked".

## Status List 2021

Verity demonstrates revocation using [Status List 2021](https://w3c-ccg.github.io/vc-status-list-2021/). The status list is a base 64 encoded, zlib compressed bitstring. That is, each bit corresponds to the revoked or active status of a credential. When issuing a credential, the `credentialStatus` object includes two critical properties: a url to fetch the revocation list and the index in the list that corresponds to the given credential. Notice that credentials are themselves immutable, so these properties must be determined in advance, at issuance. The revocation list is itself a verifiable credential, however, but since webservers can always change what is returned at a given URL, the returned revocation list is essential mutable.

A more simple approach might be a single URL that returns the status of a credential. However, each time a verifier checked the URL, it would leak activity back to the issuer. To counter this, the revocation list contains the status of 16KB worth, or 131,072 credentials. For the average case, this ensures "herd privacy" for users.

You can read more about Verity's implementation in the [Revoking a Credential](/docs/tutorials/revoke-a-credential) tutorial.
