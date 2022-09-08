import { v4 as uuidv4 } from "uuid"

import {
  ClaimFormat,
  DescriptorMap,
  DidKey,
  PresentationDefinition,
  Verifiable,
  W3CCredential
} from "../../types"
import {
  buildIssuer,
  encodeVerifiablePresentation,
  PRESENTAION_SUBMISSION_TYPE_NAME,
  VERIFIABLE_PRESENTATION_TYPE_NAME
} from "../utils"

import type { JWT, VerifyPresentationOptions } from "did-jwt-vc/src/types"

export async function buildPresentationSubmission(
  didKey: DidKey,
  presentationDefinition: PresentationDefinition,
  verifiableCredential: Verifiable<W3CCredential> | Verifiable<W3CCredential>[],
  options?: VerifyPresentationOptions
): Promise<JWT> {
  const client = buildIssuer(didKey.subject, didKey.privateKey)

  const presentationSubmission = {
    id: uuidv4(),
    definition_id: presentationDefinition.id,
    descriptor_map: presentationDefinition.input_descriptors.map<DescriptorMap>(
      (d, i) => {
        return {
          id: d.id,
          format: ClaimFormat.JwtVc,
          path: `$.verifiableCredential[${i}]`
        }
      }
    )
  }

  const vp = await encodeVerifiablePresentation(
    client.did,
    verifiableCredential,
    client,
    options,
    [VERIFIABLE_PRESENTATION_TYPE_NAME, PRESENTAION_SUBMISSION_TYPE_NAME],
    { presentation_submission: presentationSubmission }
  )

  return vp
}
