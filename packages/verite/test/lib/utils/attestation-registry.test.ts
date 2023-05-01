import { getAttestionDefinition } from "../../../lib"
import { AttestationTypes } from "../../../types"

describe("Attestation Registry", () => {
  it("works", async () => {
    const ad = getAttestionDefinition(AttestationTypes.EntityAccInvAttestation)
    const expected = {
      attestation: {
        type: "EntityAccInvAttestation",
        process:
          "https://verite.id/definitions/processes/kycaml/0.0.1/generic--usa-entity-accinv-all-checks"
      },
      schema:
        "https://verite.id/definitions/schemas/0.0.1/EntityAccInvAttestation"
    }
    expect(ad).toMatchObject(expected)
  })
})
