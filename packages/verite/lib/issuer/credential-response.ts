import {
  CredentialManifest,
  CredentialResponseWrapper,
  Signer,
  JWT,
  MaybeCredential,
  W3CCredential,
  Verifiable
} from "../../types"
import { CredentialResponseWrapperBuilder } from "../builders/credential-response-wrapper-builder"
import { signJWT, verifyJWT } from "../utils"
import { decodeAndVerifyResponseCredentials } from "../validators/validate-credential-response"

/***
 * Convenience method for composing a signed, JWT-encoded Credential Response
 */
export async function composeCredentialResponseJWT(
  manifest: CredentialManifest,
  applicant: string,
  application_id: string,
  signer: Signer,
  vc: JWT | JWT[]
): Promise<JWT> {
  const credentialResponse = new CredentialResponseWrapperBuilder<JWT>()
    .withCredentialResponse((r) => {
      r.initFromManifest(manifest)
      r.applicant(applicant)
      r.application_id(application_id)
    })
    .verifiableCredential(vc)
    .build()

  const responseJwt = await signJWT(credentialResponse, signer)
  return responseJwt
}

/**
 * Decode a JWT-encoded Credential Response.
 *
 * This method decodes and verifies the JWT-encoded Credential Application,
 * returning the decoded form.
 *
 * Note: does not decode the Credential Response's verifiable credentials.
 *
 * @returns the decoded Credential Response
 * @throws VerificationException if the Credential Response is not well-formed
 */
export async function decodeCredentialResponseJWT(
  encodedResponse: JWT
): Promise<CredentialResponseWrapper<MaybeCredential>> {
  const result = await verifyJWT(encodedResponse)
  return result.payload as CredentialResponseWrapper<MaybeCredential>
}

/**
 * Decode and validate a JWT-encoded Credential Response.
 *
 * This is a convenience wrapper around `decodeCredentialResponseJwt` and `decodeAndVerifyResponseCredentials`,
 * which can be called separately.
 *
 * @returns the decoded Credential Response
 * @throws VerificationException if the Credential Response is not valid
 */
export async function validateCredentialResponseJWT(
  encodedResponse: JWT
): Promise<CredentialResponseWrapper<Verifiable<W3CCredential>>> {
  const response = await decodeCredentialResponseJWT(encodedResponse)
  const decodedResponse = await decodeAndVerifyResponseCredentials(response)
  return decodedResponse
}
