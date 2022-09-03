import { PresentationDefinition } from "../../../types/PresentationDefinition"
import { ACTIVE_STATUS_CONSTRAINT, minimumValueConstraint, stringValueConstraint, subjectContraint, schemaConstraint, trustedAuthorityConstraint } from "../../builders"
import { InputDescriptorBuilder } from "../../builders/input-descriptors/input-descriptor-builder"
import { AttestationDefinition, CREDIT_SCORE_ATTESTATION, getAttestionDefinition, KYCAML_ATTESTATION } from "../attestation-registry"
import { CREDIT_SCORE_CREDENTIAL_TYPE_NAME, CREDIT_SCORE_PRESENTATION_DEFINITION_TYPE_NAME, KYCAML_CREDENTIAL_TYPE_NAME, KYCAML_PRESENTATION_DEFINITION_TYPE_NAME } from "./constants"


export function kycAmlPresentationDefinition(trustedAuthorities: string[] = []) {
  return createPresentationDefinitionFromProcessAttestation(
    KYCAML_PRESENTATION_DEFINITION_TYPE_NAME,
    getAttestionDefinition(KYCAML_ATTESTATION),
    KYCAML_CREDENTIAL_TYPE_NAME,
    trustedAuthorities
    )
}
export function createPresentationDefinitionFromProcessAttestation(
  definitionId: string,
  attestationDefinition: AttestationDefinition, 
  credentialType: string,
  trustedAuthorities: string[] = []) {
  const pathPrefixConvention = `${attestationDefinition.type}.`
  const inputDescriptor = new InputDescriptorBuilder()
    .id(credentialType)
    .name("Proof of KYC")
    .purpose("Please provide a valid credential from a KYC/AML issuer")
    .constraints((b) => {
      b.withFieldConstraint(stringValueConstraint("process", pathPrefixConvention))
        .withFieldConstraint(stringValueConstraint("approvalDate", pathPrefixConvention))
        .withFieldConstraint(subjectContraint)
        .withFieldConstraint(schemaConstraint(attestationDefinition.schema))
        .withFieldConstraint(trustedAuthorityConstraint(trustedAuthorities))
        .isHolder(["subjectId"])
        .statuses(ACTIVE_STATUS_CONSTRAINT)
    })
    .build()

  return {
    id: definitionId,
    input_descriptors: [inputDescriptor]
  }
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
  const inputDescriptor = new InputDescriptorBuilder()
    .id(CREDIT_SCORE_CREDENTIAL_TYPE_NAME)
    .name("Proof of Credit Score")
    .purpose("Please provide a valid credential from a Credit Score issuer")
    .constraints((b) => {
      b.withFieldConstraint(minimumValueConstraint("score", minimumCreditScore!, pathPrefixConvention))
        .withFieldConstraint(stringValueConstraint("scoreType", pathPrefixConvention))
        .withFieldConstraint(stringValueConstraint("provider", pathPrefixConvention))
        .withFieldConstraint(schemaConstraint(attestationInfo.schema))
        .withFieldConstraint(trustedAuthorityConstraint(trustedAuthorities))
        .isHolder(["subjectId"])
        .statuses(ACTIVE_STATUS_CONSTRAINT)
    })
    .build()
  return {
    id: CREDIT_SCORE_PRESENTATION_DEFINITION_TYPE_NAME,
    input_descriptors: [inputDescriptor]
  }
}
