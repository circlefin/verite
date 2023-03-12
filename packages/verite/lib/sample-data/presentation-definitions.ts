import { AttestationTypes, PresentationDefinition } from "../../types"
import {
  ACTIVE_STATUS_CONSTRAINT,
  minimumValueConstraint,
  stringValueConstraint,
  schemaConstraint,
  trustedAuthorityConstraint,
  InputDescriptorBuilder,
  PresentationDefinitionBuilder,
  InputDescriptorConstraintsBuilder,
  subjectContraint
} from "../builders"
import { getAttestionDefinition } from "../utils"
import {
  CREDIT_SCORE_CREDENTIAL_TYPE_NAME,
  CREDIT_SCORE_PRESENTATION_DEFINITION_ID
} from "./constants"
import {
  attestationToCredentialType,
  attestationToPresentationDefinitionId
} from "./constants-maps"

// TODO: name
export function kycAmlPresentationDefinition(
  trustedAuthorities: string[] = []
) {
  return buildProcessApprovalPresentationDefinition(
    AttestationTypes.KYCAMLAttestation,
    trustedAuthorities,
    "Proof of KYC",
    "Please provide a valid credential from a KYC/AML issuer"
  )
}

export function buildProcessApprovalPresentationDefinition(
  attestationType: AttestationTypes,
  trustedAuthorities: string[] = [],
  name?: string,
  purpose?: string
) {
  const pathPrefixConvention = `${attestationType}.`
  const attestationDefinition = getAttestionDefinition(attestationType)
  const credentialType = attestationToCredentialType(attestationType)
  const definitionId = attestationToPresentationDefinitionId(attestationType)

  const constraints = new InputDescriptorConstraintsBuilder()
    .addField(stringValueConstraint("process", pathPrefixConvention))
    .addField(stringValueConstraint("approvalDate", pathPrefixConvention))

  const inputDescriptor = new InputDescriptorBuilder()
    .id(credentialType)
    .name(name || `Proof of ${attestationType}`)
    .purpose(
      purpose ||
        `Please provide a valid credential from a ${attestationType} issuer`
    )
    .constraints(constraints.build())
    .withConstraints(
      withDefaults(attestationDefinition.schema, trustedAuthorities)
    )
    .build()

  return new PresentationDefinitionBuilder({ id: definitionId })
    .input_descriptors([inputDescriptor])
    .build()
}

const withDefaults =
  (schema: string, trustedAuthorities: string[] = []) =>
  (b: InputDescriptorConstraintsBuilder): void => {
    b.addField(subjectContraint)
      .addField(schemaConstraint(schema))
      .addField(trustedAuthorityConstraint(trustedAuthorities))
      .isHolder(["subjectId"])
      .statuses(ACTIVE_STATUS_CONSTRAINT)
  }

/**
 * Build a Presentation Definition requesting a Credit Score Attestation
 */
export function creditScorePresentationDefinition(
  trustedAuthorities: string[] = [],
  minimumCreditScore?: number,
  name?: string,
  purpose?: string
): PresentationDefinition {
  const attestationType = AttestationTypes.CreditScoreAttestation
  const attestationInfo = getAttestionDefinition(attestationType)
  const pathPrefixConvention = `${attestationType}.`

  const constraintsBuilder = new InputDescriptorConstraintsBuilder()
    .addField(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      minimumValueConstraint("score", minimumCreditScore!, pathPrefixConvention)
    )
    .addField(stringValueConstraint("scoreType", pathPrefixConvention))
    .addField(stringValueConstraint("provider", pathPrefixConvention))

  const inputDescriptor = new InputDescriptorBuilder()
    .id(CREDIT_SCORE_CREDENTIAL_TYPE_NAME)
    .name(name || `Proof of ${attestationType}`)
    .purpose(
      purpose ||
        `Please provide a valid credential from a ${attestationType} issuer`
    )
    .constraints(constraintsBuilder.build())
    .withConstraints(withDefaults(attestationInfo.schema, trustedAuthorities))
    .build()
  return {
    id: CREDIT_SCORE_PRESENTATION_DEFINITION_ID,
    input_descriptors: [inputDescriptor]
  }
}
