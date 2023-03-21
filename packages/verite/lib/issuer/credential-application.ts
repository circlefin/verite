import { JWTHeader, JWTOptions, JWTPayload } from "did-jwt"

import {
  CredentialApplicationWrapper,
  CredentialManifest,
  DecodedCredentialApplicationWrapper,
  Signer,
  EncodedCredentialApplicationWrapper,
  JWT
} from "../../types"
import {
  signJWT,
  decodeJWT2,
  verifyJWT2,
  verifyVerifiableCredential
} from "../utils"
import { validateCredentialApplication } from "../validators"

// TOFIX: where should this live?
export async function signVeriteJwt(
  payload: Partial<JWTPayload>, // TOFIX: export JWTPayload from did-jwt
  signer: Signer,
  header?: Partial<JWTHeader>
): Promise<JWT> {
  const jwt = await signJWT(payload, signer, header)

  return jwt
}

/**
 * Decode an encoded Credential Application.
 *
 * This method decodes the submitted Credential Application, verifies it as a Verifiable
 * Presentation, and returns the decoded Credential Application.
 *
 * @returns the decoded Credential Application
 * @throws VerificationException if the Credential Application is not valid
 */
export async function decodeAndVerifyCredentialApplicationJwt(
  encodedApplication: EncodedCredentialApplicationWrapper
): Promise<DecodedCredentialApplicationWrapper> {
  const result = await decodeJWT2(encodedApplication)
  const valid = await verifyJWT2(encodedApplication) // TOFIX: options
  const caw = result.payload as CredentialApplicationWrapper
  let decodedArray
  if (caw.verifiableCredential) {
    decodedArray = await Promise.all(
      caw.verifiableCredential.map((vc) => verifyVerifiableCredential(vc))
    )
  }
  const decoded = {
    credential_application: caw.credential_application,
    ...(decodedArray !== undefined && { verifiableCredential: decodedArray })
  }

  return decoded
}

/**
 * Decode and validate an encoded Credential Application.
 *
 * This is a convenience wrapper around `decodeCredentialApplication` and `validateCredentialApplication`,
 * which can be called separately.
 *
 * @returns the decoded Credential Application
 * @throws VerificationException if the Credential Application is not a valid
 *  Verifiable Presentation
 */
export async function evaluateCredentialApplication(
  encodedApplication: EncodedCredentialApplicationWrapper,
  manifest: CredentialManifest,
  options?: JWTOptions
): Promise<DecodedCredentialApplicationWrapper> {
  // TOFIX: so many verifies
  const application = await decodeAndVerifyCredentialApplicationJwt(
    encodedApplication
  )

  await validateCredentialApplication(application, manifest)
  return application
}

//////////
// unwound versions
//////////////
export async function decodeCredentialApplicationJwt(
  encodedApplication: EncodedCredentialApplicationWrapper
): Promise<DecodedCredentialApplicationWrapper> {
  // rename this to CredentialApplicationWrapper
  const result = await decodeJWT2(encodedApplication)
  return result as DecodedCredentialApplicationWrapper
}

// TODO: generic version
// Deep decode
export async function validateXYZ(
  application: DecodedCredentialApplicationWrapper, // rename this to CredentialApplicationWrapper
  manifest: CredentialManifest,
  options?: JWTOptions
): Promise<DecodedCredentialApplicationWrapper> {
  // void / bool
  // TOFIX: so many verifies

  await validateCredentialApplication(application, manifest)
  return application
}

/*
func prepareCredentialManifest(issuerDID did.DIDKey, licenseSchemaID string) (*manifest.CredentialManifest, error) {

func prepareCredentialApplication(cm manifest.CredentialManifest, vc credential.VerifiableCredential) (*manifest.CredentialApplicationWrapper, error) {

func issueApplicationCredential(id did.DIDKey, s schema.VCJSONSchema) (*credential.VerifiableCredential, error) {

https://github.com/TBD54566975/ssi-sdk/blob/a243dcc2d1d113a6128c8b05ff7929483b4d1b65/example/manifest/manifest.go#L310

	func processCredentialApplication(cm manifest.CredentialManifest, 
		ca manifest.CredentialApplicationWrapper, 
		s schema.VCJSONSchema, 
		issuerDID did.DIDKey) (*manifest.CredentialResponseWrapper, error) {


	if _, err = manifest.IsValidCredentialApplicationForManifest(cm, request)

		licenseCredential, err := issueDriversLicenseCredential(issuerDID, applicantCredential.CredentialSubject.GetID(), s, data)

*/
