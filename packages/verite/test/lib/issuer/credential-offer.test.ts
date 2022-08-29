import { v4 as uuidv4 } from "uuid"

import { buildCredentialOffer } from "../../../lib/issuer/credential-offer"
import { proofOfControlPresentationDefinition } from "../../../lib/utils"
import { manifestFixture } from "../../fixtures/manifests"
describe("buildCredentialOffer", () => {
  it("returns a Credential Offer", () => {
    const id = uuidv4()

    // Use Manifest fixture 0
    const manifest = manifestFixture(0)

    // URL the client should POST a Credential Application to
    const replyUrl = "http://example.com/replyUrl"

    const offer = buildCredentialOffer(id, manifest, replyUrl)

    const expected = {
      id,
      type: "CredentialOffer",
      from: "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp",
      // created_time: "2021-10-26T20:57:43.373Z",
      // expires_time: "2021-11-25T20:57:43.373Z",
      reply_url: "http://example.com/replyUrl",
      body: {
        // challenge: "b68f2c74-8965-4281-8623-4836567b8258",
        manifest: {
          id: "KYCAMLManifest",
          version: "0.1.0",
          issuer: {
            id: "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp",
            name: "Issuer Inc."
          },
          format: { jwt_vc: { alg: ["EdDSA"] }, jwt_vp: { alg: ["EdDSA"] } },
          output_descriptors: [
            {
              id: "kycAttestationOutput",
              schema: [
                {
                  uri: "https://verite.id/definitions/schemas/0.0.1/KYCAMLAttestation"
                }
              ],
              name: "Proof of KYC from Issuer Inc.",
              description:
                "Attestation that Issuer Inc. has completed KYC/AML verification for this subject",
              display: {
                title: {
                  text: "Issuer Inc. KYC Attestation"
                },
                subtitle: {
                  path: ["$.approvalDate", "$.vc.approvalDate"],
                  fallback: "Includes date of approval"
                },
                description: {
                  text: "The KYC authority processes Know Your Customer and Anti-Money Laundering analysis, potentially employing a number of internal and external vendor providers."
                },
                properties: [
                  {
                    label: "Process",
                    path: ["$.KYCAMLAttestation.process"],
                    schema: { type: "string" }
                  },
                  {
                    label: "Approved At",
                    path: ["$.KYCAMLAttestation.approvalDate"],
                    schema: { type: "string", format: "date-time" }
                  }
                ]
              },
              styles: {}
            }
          ],
          presentation_definition: proofOfControlPresentationDefinition()
        }
      }
    }

    expect(offer).toMatchObject(expected)

    // These values are not consistently generated, but we make sure they are
    // defined.
    expect(offer.created_time).toBeDefined()
    expect(offer.expires_time).toBeDefined()

    // The challenge will later be used when building a Credential Application.
    // It is a randomly generated UUID, but we make sure it is defined.
    expect(offer.body.challenge).toBeDefined()
  })
})
