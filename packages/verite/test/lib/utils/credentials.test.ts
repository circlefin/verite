import { randomBytes } from "crypto"

import { CredentialPayloadBuilder } from "../../../lib"
import { VerificationError } from "../../../lib/errors"
import { KYCAML_CREDENTIAL_TYPE_NAME } from "../../../lib/sample-data"
import {
  verifyVerifiableCredentialJWT,
  verifyVerifiablePresentation,
  signVerifiableCredentialJWT,
  buildSigner,
  randomDidKey,
  buildSignerFromDidKey
} from "../../../lib/utils"
import { StatusList2021Entry } from "../../../types"
import {
  creditScoreAttestationFixture,
  kycAmlAttestationFixture
} from "../../fixtures/attestations"
import { KYC_VC_SCHEMA } from "../../fixtures/credentials"

import type { CredentialPayload } from "../../../types"

const signedVc =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImRlZ3JlZSI6eyJ0eXBlIjoiQmFjaGVsb3JEZWdyZWUiLCJuYW1lIjoiQmFjY2FsYXVyw6lhdCBlbiBtdXNpcXVlcyBudW3DqXJpcXVlcyJ9fX0sInN1YiI6ImRpZDpldGhyOjB4NDM1ZGYzZWRhNTcxNTRjZjhjZjc5MjYwNzk4ODFmMjkxMmY1NGRiNCIsIm5iZiI6MTU2Mjk1MDI4MiwiaXNzIjoiZGlkOmtleTp6Nk1rc0dLaDIzbUhaejJGcGVORDZXeEp0dGQ4VFdoa1RnYTdtdGJNMXgxek02NW0ifQ.d1JNjJGQmQjAyI2oqgqeR2Naze6c2Cp20FHDiKbDg1FAMZsVNXiNKfySjzcm01rnpKFusj9N6wvWJh5HA7EZDg"
const expiredVc =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjYyMDgzNTIsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiZGVncmVlIjp7InR5cGUiOiJCYWNoZWxvckRlZ3JlZSIsIm5hbWUiOiJCYWNjYWxhdXLDqWF0IGVuIG11c2lxdWVzIG51bcOpcmlxdWVzIn19fSwic3ViIjoiZGlkOmV0aHI6MHg0MzVkZjNlZGE1NzE1NGNmOGNmNzkyNjA3OTg4MWYyOTEyZjU0ZGI0IiwibmJmIjoxNjI2MjA4MzQyLCJpc3MiOiJkaWQ6a2V5Ono2TWtzR0toMjNtSFp6MkZwZU5ENld4SnR0ZDhUV2hrVGdhN210Yk0xeDF6TTY1bSJ9.n0Cko-LZtZjrVHMjzlMUUxB6GGkx9MlNy68nALEeh_Doj42UDZkCwF872N4pVzyqKEexAX8PxAgtqote2rHMAA"
const expiredVp =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjYyMTU0MTEsInZwIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZVByZXNlbnRhdGlvbiJdfSwic3ViIjoiZGlkOmV0aHI6MHg0MzVkZjNlZGE1NzE1NGNmOGNmNzkyNjA3OTg4MWYyOTEyZjU0ZGI0IiwibmJmIjoxNjI2MjE1NDAxLCJpc3MiOiJkaWQ6a2V5Ono2TWtzR0toMjNtSFp6MkZwZU5ENld4SnR0ZDhUV2hrVGdhN210Yk0xeDF6TTY1bSJ9.UjdICQPEQOXk52Riq4t88Yol8T_gdmNag3G_ohzMTYDZRZNok7n-R4WynPrFyGASEMqDfi6ZGanSOlcFm2W6DQ"

describe("VC decoding", () => {
  it("decodes a VC", async () => {
    const decoded = await verifyVerifiableCredentialJWT(signedVc)
    expect(decoded.type.length).toEqual(1)
    expect(decoded.type[0]).toEqual("VerifiableCredential")
    expect(decoded.credentialSubject.degree.type).toEqual("BachelorDegree")
    expect(decoded.credentialSubject.degree.name).toEqual(
      "Baccalauréat en musiques numériques"
    )
  })

  it("rejects an expired VC", async () => {
    expect.assertions(1)
    await expect(verifyVerifiableCredentialJWT(expiredVc)).rejects.toThrowError(
      VerificationError
    )
  })

  it("rejects an expired VP", async () => {
    expect.assertions(1)
    await expect(verifyVerifiablePresentation(expiredVp)).rejects.toThrowError(
      VerificationError
    )
  })
})

describe("VC signing", () => {
  it("signs a VC", async () => {
    const issuerDid = "did:key:z6MksGKh23mHZz2FpeND6WxJttd8TWhkTga7mtbM1x1zM65m"
    const privateKey =
      "1f0465e2546027554c41584ca53971dfc3bf44f9b287cb15b5732ad84adb4e63be5aa9b3df96e696f4eaa500ec0b58bf5dfde59200571b44288cc9981279a238"
    const signer = buildSigner(issuerDid, privateKey)
    const issuanceDate = new Date()
    const vcPayload: CredentialPayload = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: issuerDid,
      issuanceDate: issuanceDate,
      credentialSubject: {
        degree: {
          type: "BachelorDegree",
          name: "Baccalauréat en musiques numériques"
        }
      }
    }
    const result = await signVerifiableCredentialJWT(vcPayload, signer)
    const decoded = await verifyVerifiableCredentialJWT(result)
    expect(decoded.type.length).toEqual(1)
    expect(decoded.type[0]).toEqual("VerifiableCredential")
    expect(decoded.credentialSubject.degree.type).toEqual("BachelorDegree")
    expect(decoded.credentialSubject.degree.name).toEqual(
      "Baccalauréat en musiques numériques"
    )
  })
})

describe("Verifiable Credential E2E", () => {
  it("builds and signs a verifiable credential", async () => {
    // Issuer DID and signer
    const issuerDidKey = randomDidKey(randomBytes)
    const issuerSigner = buildSignerFromDidKey(issuerDidKey)

    // Subject DID
    const subjectDidKey = randomDidKey(randomBytes)

    // Constructs and signs a Verifiable Credential
    const vc = new CredentialPayloadBuilder()
      .issuer(issuerSigner.did)
      .attestations(subjectDidKey.subject, kycAmlAttestationFixture)
      .type(KYCAML_CREDENTIAL_TYPE_NAME)
      .credentialSchema(KYC_VC_SCHEMA)
      .issuanceDate("2021-10-26T16:17:13.000Z")
      .build()

    const signedVc = await signVerifiableCredentialJWT(vc, issuerSigner)

    const decoded = await verifyVerifiableCredentialJWT(signedVc)
    expect(decoded).toMatchObject({
      credentialSubject: {
        KYCAMLAttestation: {
          type: "KYCAMLAttestation",
          process: "https://verite.id/definitions/processes/kycaml/0.0.1/usa",
          approvalDate: kycAmlAttestationFixture.approvalDate
        },
        id: subjectDidKey.subject
      },
      issuer: { id: issuerDidKey.subject },
      type: ["VerifiableCredential", "KYCAMLCredential"],
      issuanceDate: "2021-10-26T16:17:13.000Z",
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        { "@vocab": "https://verite.id/identity/" }
      ]
    })
  })

  it("can optionally support a credentialStatus", async () => {
    // Issuer DID and signer
    const issuerDidKey = randomDidKey(randomBytes)
    const issuerSigner = buildSignerFromDidKey(issuerDidKey)

    // Subject DID
    const subjectDidKey = randomDidKey(randomBytes)

    // Builds a signed Verifiable Credential with a credentialStatus
    const credentialStatus: StatusList2021Entry = {
      id: "https://dmv.example.gov/credentials/status/3#94567",
      type: "StatusList2021Entry",
      statusPurpose: "revocation",
      statusListIndex: "94567",
      statusListCredential: "https://example.com/credentials/status/3"
    }

    // Constructs and signs a Verifiable Credential
    const vc = new CredentialPayloadBuilder()
      .issuer(issuerSigner.did)
      .attestations(subjectDidKey.subject, kycAmlAttestationFixture)
      .type(KYCAML_CREDENTIAL_TYPE_NAME)
      .credentialSchema(KYC_VC_SCHEMA)
      .credentialStatus(credentialStatus)
      .build()

    const signedVc = await signVerifiableCredentialJWT(vc, issuerSigner)

    const decoded = await verifyVerifiableCredentialJWT(signedVc)

    expect(decoded.credentialStatus).toEqual({
      id: "https://dmv.example.gov/credentials/status/3#94567",
      type: "StatusList2021Entry",
      statusListIndex: "94567",
      statusPurpose: "revocation",
      statusListCredential: "https://example.com/credentials/status/3"
    })
  })

  it("builds and signs a verifiable credential with multiple attestations", async () => {
    const issuerDidKey = randomDidKey(randomBytes)
    const issuerSigner = buildSignerFromDidKey(issuerDidKey)

    const subjectDidKey = randomDidKey(randomBytes)
    const attestations = [
      kycAmlAttestationFixture,
      creditScoreAttestationFixture
    ]

    const vc = new CredentialPayloadBuilder()
      .issuer(issuerSigner.did)
      .attestations(subjectDidKey.subject, attestations)
      .type("HybridCredential")
      .build()

    const signedVc = await signVerifiableCredentialJWT(vc, issuerSigner)

    const result = await verifyVerifiableCredentialJWT(signedVc)

    expect(result).toMatchObject({
      credentialSubject: [
        {
          id: subjectDidKey.subject,
          KYCAMLAttestation: {
            type: "KYCAMLAttestation",
            process: "https://verite.id/definitions/processes/kycaml/0.0.1/usa",
            approvalDate: kycAmlAttestationFixture.approvalDate
          }
        },
        {
          id: subjectDidKey.subject,
          CreditScoreAttestation: {
            type: "CreditScoreAttestation",
            score: 700,
            scoreType: "Credit Score",
            provider: "Experian"
          }
        }
      ],
      issuer: { id: issuerSigner.did },
      type: ["VerifiableCredential", "HybridCredential"],
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        {
          "@vocab": "https://verite.id/identity/"
        }
      ]
    })
  })
})
