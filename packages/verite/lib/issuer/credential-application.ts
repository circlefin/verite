import {
  CreatePresentationOptions,
  VerifyPresentationOptions
} from "did-jwt-vc/src/types"
import { v4 as uuidv4 } from "uuid"

import {
  ClaimFormat,
  CredentialManifest,
  DecodedCredentialApplication,
  DescriptorMap,
  DidKey,
  EncodedCredentialApplication,
  JwtPresentationPayload
} from "../../types"
import {
  CredentialApplicationBuilder,
  HOLDER_PROPERTY_NAME,
  PresentationSubmissionBuilder
} from "../builders"
import {
  buildIssuer,
  CREDENTIAL_APPLICATION_TYPE_NAME,
  verifyVerifiablePresentation,
  signVerifiablePresentation,
  VERIFIABLE_PRESENTATION_TYPE_NAME,
  VC_CONTEXT_URI
} from "../utils"
import { validateCredentialApplication } from "../validators"

export function buildCredentialApplication(
  manifest: CredentialManifest,
  presentationType: string | string[] = [
    VERIFIABLE_PRESENTATION_TYPE_NAME,
    CREDENTIAL_APPLICATION_TYPE_NAME
  ]
): JwtPresentationPayload {
  const applicationBuilder = new CredentialApplicationBuilder()
    .id(uuidv4())
    .manifest_id(manifest.id)
    .format({
      jwt_vp: manifest.presentation_definition?.format?.jwt_vp
    })

  if (manifest.presentation_definition) {
    applicationBuilder.presentation_submission(
      new PresentationSubmissionBuilder()
        .id(uuidv4())
        .definition_id(manifest.presentation_definition.id)
        .descriptor_map(
          manifest.presentation_definition?.input_descriptors?.map<DescriptorMap>(
            (d) => {
              return {
                id: d.id,
                format: ClaimFormat.JwtVp,
                path: `$.${HOLDER_PROPERTY_NAME}`
              }
            }
          )
        )
        .build()
    )
  }

  const application = applicationBuilder.build()

  const payload = Object.assign({
    vp: {
      "@context": [VC_CONTEXT_URI],
      type: presentationType,
      credential_application: application
    }
  })

  return payload
}

/**
 * Generates a Credential Application as response to a Credential Manifest
 *
 * @returns an encoded & signed application that can be submitted to the issuer
 */
export async function composeCredentialApplication(
  didKey: DidKey,
  manifest: CredentialManifest,
  options?: CreatePresentationOptions
): Promise<EncodedCredentialApplication> {
  const client = buildIssuer(didKey.subject, didKey.privateKey)
  const application = buildCredentialApplication(manifest)
  const vp = await signVerifiablePresentation(application, client, options)

  return vp
}

/**
 * Decode an encoded Credential Application.
 *
 * A Credential Application is a Verifiable Presentation. This method decodes
 * the submitted Credential Application, verifies it as a Verifiable
 * Presentation, and returns the decoded Credential Application.
 *
 * @returns the decoded Credential Application
 * @throws VerificationException if the Credential Application is not a valid
 *  Verifiable Presentation
 */
export async function decodeCredentialApplication(
  encodedApplication: EncodedCredentialApplication,
  options?: VerifyPresentationOptions
): Promise<DecodedCredentialApplication> {
  const decodedPresentation = await verifyVerifiablePresentation(
    encodedApplication,
    options
  )

  return decodedPresentation as DecodedCredentialApplication
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
  encodedApplication: EncodedCredentialApplication,
  manifest: CredentialManifest,
  options?: VerifyPresentationOptions
): Promise<DecodedCredentialApplication> {
  const application = await decodeCredentialApplication(
    encodedApplication,
    options
  )
  await validateCredentialApplication(application, manifest)
  return application
}
