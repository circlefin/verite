import * as creditScoreSchema from "./CreditScoreAttestation.json"
import * as kycSchema from "./KYCAMLAttestation.json"

export const SCHEMA_MAP: Record<string, Record<string, unknown>> = {
  "https://demos.verite.id/schemas/identity/1.0.0/KYCAMLAttestation": kycSchema,
  "https://demos.verite.id/schemas/identity/1.0.0/CreditScoreAttestation":
    creditScoreSchema
}

export function findSchemaById(
  id: string
): Record<string, unknown> | undefined {
  return SCHEMA_MAP[id]
}
