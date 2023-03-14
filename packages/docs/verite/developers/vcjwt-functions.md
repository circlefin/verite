---
sidebar_position: 6
---

# VC-JWT Functions

Verite conforms to the [VC-JWT Test Suite](https://github.com/decentralized-identity/JWS-Test-Suite), which is the interoperability test suite for the Verifiable Credential 1.1 data model.

Verite relies on [did-jwt-vc](https://github.com/decentralized-identity/did-jwt-vc/) for the core VC-JWT signing and verifying, using the same preprocessing as is used in the [did-jwt-vc implementation of JWS-Test-Suite](https://github.com/decentralized-identity/JWS-Test-Suite/tree/main/implementations/did-jwt-vc) to ensure conformance with the VC data model version 1.1 (including cross-compatibility with other verifiable encodings).

Examples of the direct use of these sign/verify functions are below.

## Create VC-JWT

```ts
import {
  buildIssuer,
  CredentialPayload,
  encodeVerifiableCredential
} from "verite"

const issuer = "did:key:z6MksGKh23mHZz2FpeND6WxJttd8TWhkTga7mtbM1x1zM65m"
const signer = buildIssuer(
  issuer,
  "1f0465e2546027554c41584ca53971dfc3bf44f9b287cb15b5732ad84adb4e63be5aa9b3df96e696f4eaa500ec0b58bf5dfde59200571b44288cc9981279a238"
)
const issuanceDate = new Date()
const vcPayload: CredentialPayload = {
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  type: ["VerifiableCredential"],
  issuer: issuer,
  issuanceDate: issuanceDate,
  credentialSubject: {
    degree: {
      type: "BachelorDegree",
      name: "Baccalauréat en musiques numériques"
    }
  }
}
const result = await encodeVerifiableCredential(vcPayload, signer)
```

## Verify VC-JWT

```ts
import { verifyVerifiableCredential } from "verite"

const vcJwt =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImRlZ3JlZSI6eyJ0eXBlIjoiQmFjaGVsb3JEZWdyZWUiLCJuYW1lIjoiQmFjY2FsYXVyw6lhdCBlbiBtdXNpcXVlcyBudW3DqXJpcXVlcyJ9fX0sInN1YiI6ImRpZDpldGhyOjB4NDM1ZGYzZWRhNTcxNTRjZjhjZjc5MjYwNzk4ODFmMjkxMmY1NGRiNCIsIm5iZiI6MTU2Mjk1MDI4MiwiaXNzIjoiZGlkOmtleTp6Nk1rc0dLaDIzbUhaejJGcGVORDZXeEp0dGQ4VFdoa1RnYTdtdGJNMXgxek02NW0ifQ.d1JNjJGQmQjAyI2oqgqeR2Naze6c2Cp20FHDiKbDg1FAMZsVNXiNKfySjzcm01rnpKFusj9N6wvWJh5HA7EZDg"
const decoded = await verifyVerifiableCredential(signedVc)
```
