import {
  PresentationDefinition,
  CredentialIssuer,
  CredentialManifest,
  EntityStyle
} from "../../types"
import {
  buildManifest,
  HOLDER_PROPERTY_NAME,
  JWT_VP_CLAIM_FORMAT_DESIGNATION,
  OutputDescriptorBuilder,
  PresentationDefinitionBuilder
} from "../builders"
import {
  CREDIT_SCORE_ATTESTATION,
  getAttestionDefinition,
  KYCAML_ATTESTATION
} from "../utils/attestation-registry"
import {
  PROOF_OF_CONTROL_PRESENTATION_DEF_ID_TYPE_NAME,
  KYCAML_CREDENTIAL_TYPE_NAME,
  CREDIT_SCORE_CREDENTIAL_TYPE_NAME,
  CREDIT_SCORE_MANIFEST_ID,
  KYCAML_MANIFEST_ID
} from "./constants"

export function proofOfControlPresentationDefinition(): PresentationDefinition {
  const p = new PresentationDefinitionBuilder({
    id: PROOF_OF_CONTROL_PRESENTATION_DEF_ID_TYPE_NAME
  })
    .format(JWT_VP_CLAIM_FORMAT_DESIGNATION)
    .addInputDescriptor("proofOfIdentifierControlVP", (b) => {
      b.name("Proof of Control Verifiable Presentation")
        .purpose("A VP establishing proof of identifier control over the DID.")
        .format(JWT_VP_CLAIM_FORMAT_DESIGNATION)
        .withConstraints((c) => {
          c.addField((f) => {
            f.id(HOLDER_PROPERTY_NAME)
            f.path([`$.${HOLDER_PROPERTY_NAME}`]).purpose(
              "The VP should contain a DID in the holder, which is the same DID that signs the VP. This DID will be used as the subject of the issued VC"
            )
          })
        })
    })
    .build()

  return p
}

/**
 * Whether or not a manifest requires revocable credentials.
 */
export function requiresRevocableCredentials(
  manifest: CredentialManifest
): boolean {
  return manifest.id === KYCAML_MANIFEST_ID
}

/**
 * Generate a Credential Manifest for a KYC/AML Attestation.
 *
 * @param issuer The issuer for the credential
 * @param styles An optional list of styles to use for the credential
 *
 * @returns a Credential Manifest
 */
export function buildKycAmlManifest(
  issuer: CredentialIssuer,
  styles: EntityStyle = {}
): CredentialManifest {
  const attestationInfo = getAttestionDefinition(KYCAML_ATTESTATION)

  const outputDescriptor = new OutputDescriptorBuilder()
    .id(`${KYCAML_CREDENTIAL_TYPE_NAME}`)
    .schema(attestationInfo.schema)
    .name(`Proof of KYC from ${issuer.name}`)
    .description(
      `Attestation that ${issuer.name} has completed KYC/AML verification for this subject`
    )
    .styles(styles)
    .withDisplay(`${issuer.name} KYC Attestation`, (d) => {
      d.title(`${issuer.name} KYC Attestation`)
        .subtitle({
          path: ["$.approvalDate", "$.vc.approvalDate"],
          fallback: "Includes date of approval"
        })
        .description(
          "The KYC authority processes Know Your Customer and Anti-Money Laundering analysis, potentially employing a number of internal and external vendor providers."
        )
        .addStringProperty("Process", (p) =>
          p.path([`$.${KYCAML_ATTESTATION}.process`])
        )
        .addDateTimeProperty("Approved At", (p) =>
          p.path([`$.${KYCAML_ATTESTATION}.approvalDate`])
        )
    })
    .build()

  return buildManifest(
    KYCAML_MANIFEST_ID,
    issuer,
    [outputDescriptor],
    proofOfControlPresentationDefinition()
  )
}

export function buildCreditScoreManifest(
  issuer: CredentialIssuer,
  styles: EntityStyle = {}
): CredentialManifest {
  const attestationInfo = getAttestionDefinition(CREDIT_SCORE_ATTESTATION)

  const outputDescriptor = new OutputDescriptorBuilder()
    .id(`${CREDIT_SCORE_CREDENTIAL_TYPE_NAME}`)
    .schema(attestationInfo.schema)
    .name(`Proof of Credit Score from ${issuer.name}`)
    .description(
      `Attestation that ${issuer.name} has performed a Credit Score check for this subject`
    )
    .styles(styles)
    .withDisplay(`${issuer.name} Risk Score`, (d) => {
      d.subtitle({
        path: [`$.${CREDIT_SCORE_ATTESTATION}.scoreType`],
        fallback: "Includes credit score"
      })
        .description(
          "The Credit Score authority processes credit worthiness analysis, potentially employing a number of internal and external vendor providers."
        )
        .addNumberProperty("Score", (p) =>
          p.path([`$.${CREDIT_SCORE_ATTESTATION}.score`])
        )
        .addStringProperty("Score Type", (p) =>
          p.path([`$.${CREDIT_SCORE_ATTESTATION}.scoreType`])
        )
        .addStringProperty("Provider", (p) =>
          p.path([`$.${CREDIT_SCORE_ATTESTATION}.provider`])
        )
    })
    .build()

  return buildManifest(
    CREDIT_SCORE_MANIFEST_ID,
    issuer,
    [outputDescriptor],
    proofOfControlPresentationDefinition()
  )
}
