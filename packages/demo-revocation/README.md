# Revocation Demo

This is a simple example of how revocation works using [Status List 2021](https://w3c-ccg.github.io/vc-status-list-2021/). The revocation status is essentially stored in a compressed and encoded bitstring, with each credential having its own index. If the bit at the index is a 1, the credential is revoked. Otherwise, it's not revoked.

Since Verifiable Credentials cannot be tampered with (aka they are read-only), you cannot simply revoke them. Instead, the revocation status is stored in a separate credential, are referenced in the `credentialStatus` property, and can be retrieved at the given URL.

## Getting Started

```sh
npm run setup
npm run dev
```
