import { isEmpty } from "lodash"

import {
  InputDescriptorConstraintStatusDirective,
  InputDescriptorConstraintDirective
} from "../../../types"
import { CREDENTIAL_SCHEMA_PROPERTY_NAME, CREDENTIAL_SUBJECT_PROPERTY_NAME, ID_PROPERTY_NAME, STRING_SCHEMA } from "../common"
import { InputDescriptorConstraintFieldBuilder } from "./input-descriptor-constraints-field"

export const ACTIVE_STATUS_CONSTRAINT = {
  active: {
    directive: InputDescriptorConstraintStatusDirective.REQUIRED
  }
}

export const REQUIRED_PREDICATE: InputDescriptorConstraintDirective =
  InputDescriptorConstraintDirective.REQUIRED

const SubjectFieldId = "subjectId"

export const stringValueConstraint =
  (property: string, prefix?: string) =>
  (b: InputDescriptorConstraintFieldBuilder): void => {
    const path = `${prefix ?? ""}${property}`

    b.path(attestationConstraintPaths(path))
      .purpose(`The Attestation must contain the field: '${property}'.`)
      .predicate(REQUIRED_PREDICATE)
      .filter({
        ...STRING_SCHEMA
      })
  }

export const minimumValueConstraint =
  (property: string, minValue: number, prefix?: string) =>
  (b: InputDescriptorConstraintFieldBuilder): void => {
    const path = `${prefix ?? ""}${property}`

    b.path(attestationConstraintPaths(path))
      .purpose(
        `We can only accept credentials where the ${property} value is above ${minValue}.`
      )
      .predicate(REQUIRED_PREDICATE)
      .filter({
        type: "number",
        minimum: minValue
      })
  }

/**
 * This constraint will enforce that the credential was issued by one of the
 * `trustedAuthorities`. Pattern matching is a simple regex, so we anchor the
 * DIDs to ensure it matches completely.
 *
 * Note that the inputs here are assumed to be Ethereum addresses. If you were
 * to accept arbitrary input, you would need better handling of the regex
 * pattern.
 */
export const trustedAuthorityConstraint =
  (trustedAuthorities: string[]) =>
  (b: InputDescriptorConstraintFieldBuilder): void => {
    if (!isEmpty(trustedAuthorities)) {
      b.path(["$.issuer.id", "$.issuer", "$.vc.issuer", "$.iss"])
        .purpose(
          "We can only verify credentials attested by a trusted authority."
        )
        .filter({
          ...STRING_SCHEMA,
          pattern: trustedAuthorities.map((issuer) => `^${issuer}$`).join("|")
        })
    }
  }

export const schemaConstraint =
  (schema: string) =>
  (b: InputDescriptorConstraintFieldBuilder): void => {
    if (schema) {
      b.id(CREDENTIAL_SCHEMA_PROPERTY_NAME)
        .path(
          vcConstraintPaths(
            `${CREDENTIAL_SCHEMA_PROPERTY_NAME}.${ID_PROPERTY_NAME}`
          )
        )
        .filter({
          ...STRING_SCHEMA,
          pattern: schema
        })
        .purpose(
          "We need to ensure the credential conforms to the expected schema"
        )
    }
  }

export const subjectContraint = (
  b: InputDescriptorConstraintFieldBuilder
): void => {
  b.id(SubjectFieldId)
    .path(attestationConstraintPaths(ID_PROPERTY_NAME))
    .purpose(
      "We need to ensure the holder and the subject have the same identifier"
    )
}

function attestationConstraintPaths(path: string): string[] {
  return [
    `$.${CREDENTIAL_SUBJECT_PROPERTY_NAME}.${path}`,
    `$.vc.${CREDENTIAL_SUBJECT_PROPERTY_NAME}.${path}`,
    `$.${path}`
  ]
}

function vcConstraintPaths(path: string): string[] {
  return [`$.${path}`, `$.vc.${path}`]
}
