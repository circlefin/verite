import { randomBytes } from "crypto"

import {
  composeCredentialApplication,
  evaluateCredentialApplication
} from "../../../lib"
import { buildSampleProcessApprovalManifest } from "../../../lib/sample-data"
import { buildIssuer, randomDidKey } from "../../../lib/utils/did-fns"
import {
  AttestationTypes,
  CredentialIssuer,
  DidKey,
  Issuer
} from "../../../types"

let subjectDidKey: DidKey
let issuerDidKey: DidKey
let issuer: Issuer
let subjectIssuer: Issuer
let credentialIssuer: CredentialIssuer

beforeEach(() => {
  subjectDidKey = randomDidKey(randomBytes)
  issuerDidKey = randomDidKey(randomBytes)
  issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
  subjectIssuer = buildIssuer(subjectDidKey.subject, subjectDidKey.privateKey)
  credentialIssuer = { id: issuer.did, name: "Verite" }
})

describe("Credential Application validator", () => {
  it("evaluateCredentialApplication does not throw an error for a valid application", async () => {
    const kycManifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      credentialIssuer
    )

    const credentialApplication = await composeCredentialApplication(
      kycManifest,
      subjectIssuer
    )

    evaluateCredentialApplication(credentialApplication, kycManifest)

    await expect(
      evaluateCredentialApplication(credentialApplication, kycManifest)
    ).resolves.not.toThrowError()
  })

  it("evaluateCredentialApplication decodes the Credential Application", async () => {
    const kycManifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      credentialIssuer
    )

    const credentialApplication = await composeCredentialApplication(
      kycManifest,
      subjectIssuer
    )

    const application = await evaluateCredentialApplication(
      credentialApplication,
      kycManifest
    )

    console.log(JSON.stringify(application, null, 2))
  })
})
