import {
  PresentationDefinition,
  VerificationError,
  VerificationSubmission
} from "@centre/verity"
import { verifyVerificationSubmission } from "../validators"
import { kycVerificationRequest } from "./requests"
import { AcceptedVerificationSubmission } from "types/AcceptedVerificationSubmission"

const kycPresentationDefinition =
  kycVerificationRequest().presentation_definition

export const PRESENTATION_DEFINITIONS: PresentationDefinition[] = [
  kycPresentationDefinition
]

export function findPresentationDefinitionById(
  id: string
): PresentationDefinition | undefined {
  return PRESENTATION_DEFINITIONS.find((p) => p.id === id)
}

export async function validateVerificationSubmission(
  verificationSubmission: VerificationSubmission
): Promise<AcceptedVerificationSubmission> {
  if (
    !hasPaths(verificationSubmission, [
      "presentation_submission",
      "presentation"
    ])
  ) {
    throw new VerificationError("Invalid JSON format")
  }

  /**
   * Ensure there is a valid presentation definition
   */
  const presentationDefinition = findPresentationDefinitionById(
    verificationSubmission.presentation_submission.definition_id
  )
  if (!presentationDefinition) {
    throw new VerificationError("Invalid Presentation Definition ID")
  }

  const errors = []
  const verified = await verifyVerificationSubmission(
    verificationSubmission,
    presentationDefinition,
    errors
  )
  if (errors.length > 0) {
    throw new VerificationError("Submission was invalid", errors)
  }
  return verified
}

function hasPaths(application: Record<string, unknown>, keys: string[]) {
  return keys.some((key) => application[key] !== undefined)
}
