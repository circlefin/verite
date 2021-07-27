import {
  createCredentialApplication,
  createVerificationSubmission,
  decodeVerifiablePresentation,
  randomDidKey
} from "@centre/verity"
import { createUser } from "lib/database"
import { createKycAmlFulfillment } from "lib/issuance/fulfillment"
import { findManifestById } from "lib/issuance/manifest"
import { validateCredentialSubmission } from "lib/issuance/submission"
import { credentialSigner } from "lib/signer"
import {
  processCredentialApplication,
  processVerificationSubmission
} from "lib/validators"
import { kycVerificationRequest } from "lib/verification/requests"
import { findPresentationDefinitionById } from "lib/verification/submission"
import { CredentialEvaluation, FieldConstraintEvaluation, InputDescriptorEvaluation } from "types"

describe("Submission validator", () => {
  it("validates a Verification Submission", async () => {
    const clientDidKey = await randomDidKey()
    const kycManifest = findManifestById("KYCAMLAttestation")
    const user = await createUser("test@test.com", {
      jumioScore: 55,
      ofacScore: 2
    })
    const application = await createCredentialApplication(
      clientDidKey,
      kycManifest
    )
    const acceptedApplication = await validateCredentialSubmission(application)
    const fulfillment = await createKycAmlFulfillment(
      user,
      credentialSigner,
      acceptedApplication
    )

    const fulfillmentVP = await decodeVerifiablePresentation(
      fulfillment.presentation
    )
    const clientVC = fulfillmentVP.payload.vp.verifiableCredential[0]
    const kycRequest = kycVerificationRequest()
    const submission = await createVerificationSubmission(
      clientDidKey,
      kycRequest.presentation_definition,
      clientVC
    )

    const presDef = findPresentationDefinitionById(
      "KYCAMLPresentationDefinition"
    )
    const result = await processVerificationSubmission(submission, presDef)
    expect(result.accepted()).toBeTruthy()

    const errors = result.errors()
    expect(errors).toHaveLength(0)

    const matches = result.matches()
    expect(matches).toHaveLength(1)
    const match = matches[0]
    expect(match.inputDescriptorId).toEqual("kycaml_input")
    expect(match.results).toHaveLength(1)
    expect(match.results[0].match.path).toEqual("$.issuer.id")
  })

  it("validates a CredentialApplication", async () => {
    const clientDidKey = await randomDidKey()
    const kycManifest = findManifestById("KYCAMLAttestation")
    const user = await createUser("test@test.com", {
      jumioScore: 55,
      ofacScore: 2
    })
    const application = await createCredentialApplication(
      clientDidKey,
      kycManifest
    )
    const acceptedApplication = await processCredentialApplication(
      application,
      kycManifest
    )

    expect(acceptedApplication.accepted()).toBeTruthy()
  })

  it("checks a match", async () => {
    const inputDescriptorConstraintField = {
      path: ["path1", "path2", "path3"],
      purpose: "checks that input is suitable"
    }
    const success = {path: "string1", value: "test1" }

    const fieldConstraintEvaluation = new FieldConstraintEvaluation(inputDescriptorConstraintField, success, null)
    const credEval = new CredentialEvaluation(null, [fieldConstraintEvaluation], null, null)
    const inputDescriptorEval = new InputDescriptorEvaluation("id1", [credEval])
    const match = inputDescriptorEval.match()

    expect(match).toEqual(
      [
        {
          "inputDescriptorId": "id1",
          "results": [
            {
              "constraint": {
                "path": [
                  "path1",
                  "path2",
                  "path3"
                ],
                "purpose": "checks that input is suitable"
              },
              "match": {
                "path": "string1",
                "value": "test1"
              }
            }
          ]
        }
      ]
    )
  })

  it("checks an error", async () => {
    const inputDescriptorConstraintField = {
      path: ["path1", "path2", "path3"],
      purpose: "checks that input is suitable"
    }
    const peArray = [
      {path: "string1", value:"test1"},
      {path: "string1", value: "test2"}
    ]

    const fieldConstraintEvaluation = new FieldConstraintEvaluation(inputDescriptorConstraintField, null, peArray)
    const credEval = new CredentialEvaluation(null, null, fieldConstraintEvaluation, null)
    const inputDescriptorEval = new InputDescriptorEvaluation("id1", [credEval])
    const errors = inputDescriptorEval.errors()
    expect(errors).toEqual(
      [
        {
          "message": "Credential failed to meet criteria specified by input descriptor id1",
          "details": "Credential did not match constraint: checks that input is suitable",
          "results": {
            "constraint": {
              "path": [
                "path1",
                "path2",
                "path3"
              ],
              "purpose": "checks that input is suitable"
            },
            "failures": [
              {
                "path": "string1",
                "value": "test1"
              },
              {
                "path": "string1",
                "value": "test2"
              }
            ]
          }
        }
      ]
    )
  })
})
