import { randomBytes } from "crypto"

import { CredentialPayloadBuilder } from "../../../lib"
import { KYCAML_CREDENTIAL_TYPE_NAME } from "../../../lib/sample-data"
import {
  buildIssuer,
  verifyVerifiableCredential,
  randomDidKey,
  signVerifiableCredential
} from "../../../lib/utils"
import { StatusList2021Entry } from "../../../types"
import {
  creditScoreAttestationFixture,
  kycAmlAttestationFixture
} from "../../fixtures/attestations"
import { KYC_VC_SCHEMA } from "../../fixtures/credentials"

// TODO: move away
describe("composeVerifiableCredential", () => {
  it("builds and signs a verifiable credential", async () => {
    // Map Issuer DID to Issuer for signing
    const issuerDid = randomDidKey(randomBytes)
    const issuer = buildIssuer(issuerDid.subject, issuerDid.privateKey)

    // Subject DID
    const subjectDid = randomDidKey(randomBytes)

    // Constructs and signs a Verifiable Credential
    const vc = new CredentialPayloadBuilder()
      .issuer(issuer.did)
      .attestations(subjectDid.subject, kycAmlAttestationFixture)
      .type(KYCAML_CREDENTIAL_TYPE_NAME)
      .credentialSchema(KYC_VC_SCHEMA)
      .issuanceDate("2021-10-26T16:17:13.000Z")
      .build()

    const signedVc = await signVerifiableCredential(vc, issuer)

    const decoded = await verifyVerifiableCredential(signedVc)
    expect(decoded).toMatchObject({
      credentialSubject: {
        KYCAMLAttestation: {
          type: "KYCAMLAttestation",
          process: "https://verite.id/definitions/processes/kycaml/0.0.1/usa",
          approvalDate: kycAmlAttestationFixture.approvalDate
        },
        id: subjectDid.subject
      },
      issuer: { id: issuerDid.subject },
      type: ["VerifiableCredential", "KYCAMLCredential"],
      issuanceDate: "2021-10-26T16:17:13.000Z",
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        { "@vocab": "https://verite.id/identity/" }
      ]
    })
  })

  it("can optionally support a credentialStatus", async () => {
    // Map Issuer DID to Issuer for signing
    const issuerDid = randomDidKey(randomBytes)
    const issuer = buildIssuer(issuerDid.subject, issuerDid.privateKey)

    // Subject DID
    const subjectDid = randomDidKey(randomBytes)

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
      .issuer(issuer.did)
      .attestations(subjectDid.subject, kycAmlAttestationFixture)
      .type(KYCAML_CREDENTIAL_TYPE_NAME)
      .credentialSchema(KYC_VC_SCHEMA)
      .credentialStatus(credentialStatus)
      .build()

    const signedVc = await signVerifiableCredential(vc, issuer)

    const decoded = await verifyVerifiableCredential(signedVc)

    expect(decoded.credentialStatus).toEqual({
      id: "https://dmv.example.gov/credentials/status/3#94567",
      type: "StatusList2021Entry",
      statusListIndex: "94567",
      statusPurpose: "revocation",
      statusListCredential: "https://example.com/credentials/status/3"
    })
  })

  it("builds and signs a verifiable credential with multiple attestations", async () => {
    const issuerDid = randomDidKey(randomBytes)
    const issuer = buildIssuer(issuerDid.subject, issuerDid.privateKey)
    const subjectDid = randomDidKey(randomBytes)
    const attestations = [
      kycAmlAttestationFixture,
      creditScoreAttestationFixture
    ]

    const vc = new CredentialPayloadBuilder()
      .issuer(issuer.did)
      .attestations(subjectDid.subject, attestations)
      .type("HybridCredential")
      .build()

    const signedVc = await signVerifiableCredential(vc, issuer)

    const result = await verifyVerifiableCredential(signedVc)

    expect(result).toMatchObject({
      credentialSubject: [
        {
          id: subjectDid.subject,
          KYCAMLAttestation: {
            type: "KYCAMLAttestation",
            process: "https://verite.id/definitions/processes/kycaml/0.0.1/usa",
            approvalDate: kycAmlAttestationFixture.approvalDate
          }
        },
        {
          id: subjectDid.subject,
          CreditScoreAttestation: {
            type: "CreditScoreAttestation",
            score: 700,
            scoreType: "Credit Score",
            provider: "Experian"
          }
        }
      ],
      issuer: { id: issuer.did },
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
