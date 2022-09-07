import { PresentationDefinition } from "../../types/PresentationDefinition"
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
import {
  AttestationDefinition,
  CREDIT_SCORE_ATTESTATION,
  getAttestionDefinition,
  KYCAML_ATTESTATION
} from "../utils/attestation-registry"
import {
  CREDIT_SCORE_CREDENTIAL_TYPE_NAME,
  CREDIT_SCORE_PRESENTATION_DEFINITION_TYPE_NAME,
  KYCAML_CREDENTIAL_TYPE_NAME,
  KYCAML_PRESENTATION_DEFINITION_TYPE_NAME
} from "./constants"

export function kycAmlPresentationDefinition(
  trustedAuthorities: string[] = []
) {
  return createBasicPresentationDefinitionForProcessAttestation(
    KYCAML_PRESENTATION_DEFINITION_TYPE_NAME,
    getAttestionDefinition(KYCAML_ATTESTATION),
    KYCAML_CREDENTIAL_TYPE_NAME,
    "Proof of KYC",
    "Please provide a valid credential from a KYC/AML issuer",
    trustedAuthorities
  )
}
export function createBasicPresentationDefinitionForProcessAttestation(
  definitionId: string,
  attestationDefinition: AttestationDefinition,
  credentialType: string,
  name: string,
  purpose: string,
  trustedAuthorities: string[] = []
) {
  const pathPrefixConvention = `${attestationDefinition.type}.`

  const constraints = new InputDescriptorConstraintsBuilder()
    .addField(stringValueConstraint("process", pathPrefixConvention))
    .addField(stringValueConstraint("approvalDate", pathPrefixConvention))

  const inputDescriptor = new InputDescriptorBuilder()
    .id(credentialType)
    .name(name)
    .purpose(purpose)
    .constraints(constraints.build())
    .withConstraints(
      withDefaults(attestationDefinition.schema, trustedAuthorities)
    )
    .build()

  return new PresentationDefinitionBuilder({ id: definitionId })
    .input_descriptors([inputDescriptor])
    .build()
}

export const withDefaults =
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
  minimumCreditScore?: number
): PresentationDefinition {
  const attestationInfo = getAttestionDefinition(CREDIT_SCORE_ATTESTATION)
  const pathPrefixConvention = `${CREDIT_SCORE_ATTESTATION}.`

  const constraintsBuilder = new InputDescriptorConstraintsBuilder()
    .addField(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      minimumValueConstraint("score", minimumCreditScore!, pathPrefixConvention)
    )
    .addField(stringValueConstraint("scoreType", pathPrefixConvention))
    .addField(stringValueConstraint("provider", pathPrefixConvention))

  const inputDescriptor = new InputDescriptorBuilder()
    .id(CREDIT_SCORE_CREDENTIAL_TYPE_NAME)
    .name("Proof of Credit Score")
    .purpose("Please provide a valid credential from a Credit Score issuer")
    .constraints(constraintsBuilder.build())
    .withConstraints(withDefaults(attestationInfo.schema, trustedAuthorities))
    .build()
  return {
    id: CREDIT_SCORE_PRESENTATION_DEFINITION_TYPE_NAME,
    input_descriptors: [inputDescriptor]
  }
}
