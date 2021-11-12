import {
  buildCredentialApplication,
  decodeCredentialApplication
} from "../../../lib/issuer/credential-application"
import {
  buildAndSignFulfillment,
  buildAndSignVerifiableCredential
} from "../../../lib/issuer/credential-fulfillment"
import { buildKycAmlManifest } from "../../../lib/issuer/credential-manifest"
import {
  buildIssuer,
  decodeVerifiableCredential,
  decodeVerifiablePresentation,
  randomDidKey
} from "../../../lib/utils"
import { RevocationList2021Status } from "../../../types"
import { kycAmlAttestationFixture } from "../../fixtures/attestations"

describe("buildAndSignVerifiableCredential", () => {
  it("builds a valid credential application", async () => {
    // Map Issuer DID to Issuer for signing
    const issuerDid = randomDidKey()
    const issuer = buildIssuer(issuerDid.subject, issuerDid.privateKey)

    // Subject DID
    const subjectDid = randomDidKey()

    // Claims
    const attestation = kycAmlAttestationFixture

    // Builds a signed Verifiable Credential
    const vc = await buildAndSignVerifiableCredential(
      issuer,
      subjectDid,
      attestation,
      // issuanceDate defaults to now, but for testing we will stub it out
      // Note that the did-jwt-vc library will strip out any milliseconds as
      // the JWT exp and iat properties must be in seconds.
      { issuanceDate: "2021-10-26T16:17:13.000Z" }
    )

    const decoded = await decodeVerifiableCredential(vc)

    expect(decoded).toMatchObject({
      credentialSubject: {
        KYCAMLAttestation: {
          "@type": "KYCAMLAttestation",
          authorityId: "did:web:verity.id",
          approvalDate: attestation.approvalDate,
          authorityName: "Verity",
          authorityUrl: "https://verity.id",
          authorityCallbackUrl: "https://identity.verity.id"
        },
        id: subjectDid.subject
      },
      issuer: { id: issuerDid.subject },
      type: ["VerifiableCredential", "KYCAMLAttestation"],
      evidence: undefined,
      credentialStatus: undefined,
      termsOfUse: undefined,
      issuanceDate: "2021-10-26T16:17:13.000Z",
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://verity.id/identity"
      ]
    })
  })

  it("can optionally support a credentialStatus", async () => {
    // Map Issuer DID to Issuer for signing
    const issuerDid = randomDidKey()
    const issuer = buildIssuer(issuerDid.subject, issuerDid.privateKey)

    // Subject DID
    const subjectDid = randomDidKey()

    // Claims
    const attestation = kycAmlAttestationFixture

    // Builds a signed Verifiable Credential with a credentialStatus
    const credentialStatus: RevocationList2021Status = {
      id: "https://dmv.example.gov/credentials/status/3#94567",
      type: "RevocationList2021Status",
      statusListIndex: "94567",
      statusListCredential: "https://example.com/credentials/status/3"
    }
    const vc = await buildAndSignVerifiableCredential(
      issuer,
      subjectDid,
      attestation,
      { credentialStatus }
    )

    const decoded = await decodeVerifiableCredential(vc)

    expect(decoded.credentialStatus).toEqual({
      id: "https://dmv.example.gov/credentials/status/3#94567",
      type: "RevocationList2021Status",
      statusListIndex: "94567",
      statusListCredential: "https://example.com/credentials/status/3"
    })
  })
})

describe("buildAndSignFulfillment", () => {
  it("works", async () => {
    // We need an Issuer, Credential Application, the credential claims or attestations
    // Map Issuer DID to Issuer for signing
    const issuerDid = randomDidKey()
    const issuer = buildIssuer(issuerDid.subject, issuerDid.privateKey)

    const credentialIssuer = { id: issuer.did, name: "Verity" }
    const manifest = buildKycAmlManifest(credentialIssuer)

    const subjectDid = randomDidKey()
    const options = {}
    const encodedApplication = await buildCredentialApplication(
      subjectDid,
      manifest,
      options
    )
    const application = await decodeCredentialApplication(encodedApplication)

    const attestation = kycAmlAttestationFixture
    const encodedFulfillment = await buildAndSignFulfillment(
      issuer,
      application,
      attestation
    )

    // The client can then decode the presentation
    const fulfillment = await decodeVerifiablePresentation(encodedFulfillment)

    // TODO: This is not correct
    // The encoded fulfillment looks like this:
    //
    // const fulfillment = {
    //   credential_fulfillment: {
    //     id: "44d6f8a1-7e75-43c3-b3fc-2cbcbdc442bb",
    //     manifest_id: "KYCAMLAttestation",
    //     descriptor_map: [
    //       {
    //         id: "proofOfIdentifierControlVP",
    //         format: "jwt_vc",
    //         path: "$.presentation.credential[0]"
    //       }
    //     ]
    //   },
    //   presentation:
    //     "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iXSwiaG9sZGVyIjoiZGlkOmtleTp6Nk1rb01DczFEM0pWanp3S055S2I2UXJHejQ2Smk0TjFoNUhLeTNVa2ZWQ0hkZVAiLCJ2ZXJpZmlhYmxlQ3JlZGVudGlhbCI6WyJleUpoYkdjaU9pSkZaRVJUUVNJc0luUjVjQ0k2SWtwWFZDSjkuZXlKMll5STZleUpBWTI5dWRHVjRkQ0k2V3lKb2RIUndjem92TDNkM2R5NTNNeTV2Y21jdk1qQXhPQzlqY21Wa1pXNTBhV0ZzY3k5Mk1TSXNJbWgwZEhCek9pOHZkbVZ5YVhSNUxtbGtMMmxrWlc1MGFYUjVJbDBzSW5SNWNHVWlPbHNpVm1WeWFXWnBZV0pzWlVOeVpXUmxiblJwWVd3aUxDSkxXVU5CVFV4QmRIUmxjM1JoZEdsdmJpSmRMQ0pqY21Wa1pXNTBhV0ZzVTNWaWFtVmpkQ0k2ZXlKTFdVTkJUVXhCZEhSbGMzUmhkR2x2YmlJNmV5SkFkSGx3WlNJNklrdFpRMEZOVEVGMGRHVnpkR0YwYVc5dUlpd2lZWFYwYUc5eWFYUjVTV1FpT2lKa2FXUTZkMlZpT25abGNtbDBlUzVwWkNJc0ltRndjSEp2ZG1Gc1JHRjBaU0k2SWpJd01qRXRNVEF0TWpaVU1UWTZORFE2TXpZdU1UYzJXaUlzSW1GMWRHaHZjbWwwZVU1aGJXVWlPaUpXWlhKcGRIa2lMQ0poZFhSb2IzSnBkSGxWY213aU9pSm9kSFJ3Y3pvdkwzWmxjbWwwZVM1cFpDSXNJbUYxZEdodmNtbDBlVU5oYkd4aVlXTnJWWEpzSWpvaWFIUjBjSE02THk5cFpHVnVkR2wwZVM1MlpYSnBkSGt1YVdRaWZYMTlMQ0p6ZFdJaU9pSmthV1E2YTJWNU9ubzJUV3RwWlVNemQzbG5NMGQzT1VkaU4zWjBiV2x2VW10b1UyNW5kMUZhYnpFNVJEZE1ZWFI0WlV0T1FtcHhOU0lzSW01aVppSTZNVFl6TlRJMk5qWTNOaXdpYVhOeklqb2laR2xrT210bGVUcDZOazFyYjAxRGN6RkVNMHBXYW5wM1MwNTVTMkkyVVhKSGVqUTJTbWswVGpGb05VaExlVE5WYTJaV1EwaGtaVkFpZlEudkU4Y0tYS3pRNVhzYUhnNnZmUUlMbmNjUW9tYWdIY2hfZVN4S25IOXhRM0twb2dqZHU2b0k3azUyYmhXVF9wMW5JLUtZMjFtdzBFVnNMdjhjbU1zRHciXX0sInN1YiI6ImRpZDprZXk6ejZNa29NQ3MxRDNKVmp6d0tOeUtiNlFyR3o0NkppNE4xaDVIS3kzVWtmVkNIZGVQIiwiaXNzIjoiZGlkOmtleTp6Nk1rb01DczFEM0pWanp3S055S2I2UXJHejQ2Smk0TjFoNUhLeTNVa2ZWQ0hkZVAifQ.Ph8L2AzY9i2L9RFAK6gKsSMsfXgJOTfS1I-B0henl-h0d1e_eYljsRSBgXp-wVFZRB7DWX83Zfjp_rg5HST-Aw"
    // }
    expect(fulfillment.credential_fulfillment).toMatchObject({
      manifest_id: "KYCAMLAttestation",
      descriptor_map: [
        {
          id: "proofOfIdentifierControlVP",
          format: "jwt_vc",
          path: "$.presentation.credential[0]" // TODO THIS IS WRONG
        }
      ]
    })
    expect(fulfillment.credential_fulfillment.id).toBeDefined()

    // Here we only verify the Presentation structure.
    expect(fulfillment).toMatchObject({
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation", "CredentialFulfillment"],
      // This array includes the credential but to limit scope of the test we
      // simply match on an empty object.
      verifiableCredential: [{}],
      holder: issuerDid.subject
    })
  })
})
