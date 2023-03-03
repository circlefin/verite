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
  JwtPresentationPayload,
  PresentationSubmission
} from "../../types"
import { CredentialApplicationBuilder, HOLDER_PROPERTY_NAME, PresentationSubmissionBuilder } from "../builders"
import {
  buildIssuer,
  CREDENTIAL_APPLICATION_TYPE_NAME,
  verifyVerifiablePresentation,
  signVerifiablePresentation,
  VERIFIABLE_PRESENTATION_TYPE_NAME,
  VC_CONTEXT_URI
} from "../utils"


export function constructCredentialApplication(
  manifest: CredentialManifest,
  presentationType: string | string[] = [VERIFIABLE_PRESENTATION_TYPE_NAME, CREDENTIAL_APPLICATION_TYPE_NAME]
  ): JwtPresentationPayload {

    let presentationSubmission
    if (manifest.presentation_definition) {

      presentationSubmission = new PresentationSubmissionBuilder()
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
          )).build()
      }

    const application = new CredentialApplicationBuilder()
    .id(uuidv4())
    .manifest_id(manifest.id)
    .format({
      jwt_vp: manifest.presentation_definition?.format?.jwt_vp
    }).presentation_submission(presentationSubmission)
    .build()

    const payload = Object.assign({
      vp: {
        "@context": [VC_CONTEXT_URI],
        type: presentationType,
        credential_application: application
      }
    })

  return payload;
  }


/**
 * Generates a Credential Application as response to a Credential Manifest
 *
 * @returns an encoded & signed application that can be submitted to the issuer
 */
export async function buildCredentialApplication(
  didKey: DidKey,
  manifest: CredentialManifest,
  options?: CreatePresentationOptions
): Promise<EncodedCredentialApplication> {
  const client = buildIssuer(didKey.subject, didKey.privateKey)
  const application = constructCredentialApplication(manifest)
  const vp = await signVerifiablePresentation(
    application,
    client, 
    options
  )

  return vp
}

/**
 * Verify and decode an encoded Credential Application.
 *
 * A Credential Application is a Verifiable Presentation. This method decodes the submitted Credential Application, verifies it as a Verifiable Presentation, and returs the decoded Credential Application.
 */
export async function verifyCredentialApplication(
  credentialApplication: EncodedCredentialApplication,
  options?: VerifyPresentationOptions
): Promise<DecodedCredentialApplication> {
  const decodedPresentation = await verifyVerifiablePresentation(
    credentialApplication,
    options
  )

  return decodedPresentation as DecodedCredentialApplication
}

/**
 * Fetches the manifest id from a credential application
 */
export function getManifestIdFromCredentialApplication(
  application: DecodedCredentialApplication
): string {
  return application.credential_application.manifest_id
}
