import { ClaimFormatDesignation, DataMappingSchema } from "../../types";
import { EDDSA } from "../utils/constants";

export const JWT_CLAIM_FORMAT_DESIGNATION : ClaimFormatDesignation = {
  jwt_vc: {
    alg: [EDDSA]
  },
  jwt_vp: {
    alg: [EDDSA]
  }
}

export type Action<T> = (input: T) => void

export const STRING_SCHEMA: DataMappingSchema = { type: "string" }

export const DATE_TIME_SCHEMA: DataMappingSchema = {
  type: "string",
  format: "date-time"
}

export const NUMBER_SCHEMA: DataMappingSchema = { type: "number" }