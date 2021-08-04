import type { PresentationDefinition } from "@centre/verity"
import { kycPresentationDefinition } from "@centre/verity"

export const PRESENTATION_DEFINITIONS: PresentationDefinition[] = [
  kycPresentationDefinition
]

export async function findPresentationDefinitionById(
  id: string
): Promise<PresentationDefinition | undefined> {
  return PRESENTATION_DEFINITIONS.find((p) => p.id === id)
}
