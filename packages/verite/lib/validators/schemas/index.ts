import fetch from "cross-fetch"

import * as creditScoreSchema from "./CreditScoreAttestation.json"
import * as kycSchema from "./KYCAMLAttestation.json"

const schemaCache: Record<string, Record<string, unknown>> = {
  "https://verite.id/definitions/schemas/0.0.1/KYCAMLAttestation": kycSchema,
  "https://verite.id/definitions/schemas/0.0.1/CreditScoreAttestation":
    creditScoreSchema
}

async function fetchSchemaFromUrl(
  url: string
): Promise<Record<string, unknown> | undefined> {
  try {
    const res = await fetch(url)

    if (res.ok) {
      const json = await res.json()
      schemaCache[url] = json
      return json
    }
  } catch (e) {}
}

export async function findSchemaById(
  id: string
): Promise<Record<string, unknown> | undefined> {
  if (schemaCache[id]) {
    return schemaCache[id]
  }

  return fetchSchemaFromUrl(id)
}
