// Known Attestations
export const KYCAML_ATTESTATION = "KYCAMLAttestation"
export const KYBPAML_ATTESTATION = "KYBPAMLAttestation"
export const CREDIT_SCORE_ATTESTATION = "CreditScoreAttestation"
export const ENTITY_ACC_INV_ATTESTATION = "EntityAccInvAttestation"
export const INDIV_ACC_INV_ATTESTATION = "IndivAccInvAttestation"
export const ADDRESS_OWNER_ATTESTATION = "AddressOwnerAttestation"
export const COUNTERPARTY_ACCOUNT_HOLDER_ATTESTATION = "CounterpartyAccountHolder"

// Known Credentials
export const CREDIT_SCORE_CREDENTIAL = "CreditScoreCredential"
export const KYCAML_CREDENTIAL = "KYCAMLCredential"

// Known Manifest / Definitions
export const PROOF_OF_CONTROL_PRESENTATION_DEF_ID =
  "ProofOfControlPresentationDefinition"
export const CREDIT_SCORE_MANIFEST_ID = "CreditScoreManifest"
export const KYCAML_MANIFEST_ID = "KYCAMLManifest"
export const KYCAML_PRESENTATION_DEFINITION = "KYCAMLPresentationDefinition"
export const CREDIT_SCORE_PRESENTATION_DEFINITION = "CreditScorePresentationDefinition"

// Common CM/PE
export const CREDENTIAL_APPLICATION = "CredentialApplication"
export const CREDENTIAL_FULFILLMENT = "CredentialFulfillment"
export const PRESENTAION_SUBMISSION = "PresentationSubmission"

// Other Credential Issuance / Exchange
export const CREDENTIAL_OFFER = "CredentialOffer"
export const VERIFICATION_REQUEST = "VerificationRequest"

// Common VC/VP
export const VERIFIABLE_CREDENTIAL = "VerifiableCredential"
export const VERIFIABLE_PRESENTATION = "VerifiablePresentation"
export const VC_CONTEXT = "https://www.w3.org/2018/credentials/v1"

// Verite schemas, processes, and vocabs
export const VERITE_VOCAB = "https://verite.id/identity/"
export const VERITE_SCHEMAS_PREFIX = "https://verite.id/definitions/schemas/0.0.1"
export const VERITE_PROCESSES_PREFIX = "https://verite.id/definitions/processes"
export const KYCAML_USA_PROCESS_DEFINITION = `${VERITE_PROCESSES_PREFIX}/kycaml/0.0.1/usa`
export const ACCINV_ENTITY_USA_PROCESS_DEFINITION = `${VERITE_PROCESSES_PREFIX}/kycaml/0.0.1/generic--usa-entity-accinv-all-checks`
export const ACCINV_IND_USA_PROCESS_DEFINITION = `${VERITE_PROCESSES_PREFIX}}/kycaml/0.0.1/generic--usa-indiv-accinv-all-checks`


// Common credential / manifest fields
export const CREDENTIAL_SCHEMA = "credentialSchema"
export const CREDENTIAL_SUBJECT = "credentialSubject"
export const EDDSA = "EdDSA"
export const HOLDER = "holder"
export const ID = "id"

