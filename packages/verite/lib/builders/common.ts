import { isArray, isString } from "lodash"

import {
  ClaimFormatDesignation,
  DataMappingSchema,
  DisplayMapping,
  InputDescriptorConstraintDirective,
  InputDescriptorConstraintSubjectConstraint
} from "../../types"

// Common credential / manifest fields
export const CREDENTIAL_SCHEMA_PROPERTY_NAME = "credentialSchema"
export const CREDENTIAL_SUBJECT_PROPERTY_NAME = "credentialSubject"
export const HOLDER_PROPERTY_NAME = "holder"
export const ID_PROPERTY_NAME = "id"
export const EDDSA = "EdDSA"


export const CREDENTIAL_MANIFEST_SPEC_VERSION_1_0_0 =
  "https://identity.foundation/credential-manifest/spec/v1.0.0/"

export const JWT_CLAIM_FORMAT_DESIGNATION: ClaimFormatDesignation = {
  jwt_vc: {
    alg: [EDDSA]
  },
  jwt_vp: {
    alg: [EDDSA]
  }
}

export const JWT_VC_CLAIM_FORMAT_DESIGNATION: ClaimFormatDesignation = {
  jwt_vc: {
    alg: [EDDSA]
  }
}

export const JWT_VP_CLAIM_FORMAT_DESIGNATION: ClaimFormatDesignation = {
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

export const AsDisplayMapping = (
  value: string | string[] | DisplayMapping
): DisplayMapping => {
  if (isString(value)) {
    return {
      text: value
    }
  } else if (isArray(value)) {
    return {
      path: value
    }
  }
  return value
}

export const AsSubjectConstraint = (
  subjectConstraint: string[] | InputDescriptorConstraintSubjectConstraint
): InputDescriptorConstraintSubjectConstraint => {
  if (isArray(subjectConstraint)) {
    return {
      field_id: subjectConstraint,
      directive: InputDescriptorConstraintDirective.REQUIRED
    }
  }
  return subjectConstraint
}
