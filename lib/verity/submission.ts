import { v4 as uuidv4 } from "uuid"
import { DescriptorMap, InputDescriptor, PresentationSubmission } from "./types"

export function createVPSubmission(
  definitionId: string,
  inputDescriptors: InputDescriptor[]
): PresentationSubmission {
  return {
    id: uuidv4(),
    definition_id: definitionId,
    descriptor_map: inputDescriptors.map((d) => {
      return {
        id: d.id,
        format: "jwt_vp",
        path: `$.presentation`
      }
    }) as DescriptorMap[]
  }
}

export function createVerificationSubmission(
  definitionId: string,
  inputDescriptors: InputDescriptor[]
): PresentationSubmission {
  return {
    id: uuidv4(),
    definition_id: definitionId,
    descriptor_map: inputDescriptors.map((d) => {
      return {
        id: d.id,
        format: "jwt_vc",
        path: `$.presentation.verifiableCredential[0]`
      }
    }) as DescriptorMap[]
  }
}
