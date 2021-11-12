/* eslint-disable @typescript-eslint/no-explicit-any */
import * as kycSchema from "./KycAmlAttestation.json";

export const SCHEMA_MAP: Record<string, any> = {
  "https://verity.id/schemas/identity/1.0.0/KYCAMLAttestation": kycSchema,
};

export function findSchemaById(id: string): any | undefined {
  return SCHEMA_MAP[id];
}
