import {
  PresentationDefinition,
  CredentialIssuer,
  CredentialManifest,
  EntityStyle,
  AttestationTypes,
  OutputDescriptor
} from "../../types"
import {
  buildManifest,
  HOLDER_PROPERTY_NAME,
  JWT_VP_CLAIM_FORMAT_DESIGNATION,
  OutputDescriptorBuilder,
  PresentationDefinitionBuilder
} from "../builders"
import { getAttestionDefinition } from "../utils/attestation-registry"
import {
  PROOF_OF_CONTROL_PRESENTATION_DEF_ID_TYPE_NAME,
  CREDIT_SCORE_CREDENTIAL_TYPE_NAME,
  KYCAML_MANIFEST_ID
} from "./constants"
import {
  attestationToCredentialType,
  attestationToManifestId
} from "./constants-maps"

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
  // TOFIX: generalize this
  return manifest.id === KYCAML_MANIFEST_ID
}

/**
 * Generate a Credential Manifest for the specified attestation.
 *
 * @param attestationType The type of attestation to generate a manifest for
 * @param issuer The issuer for the credential
 * @param styles An optional list of styles to use for the credential
 *
 * @returns a Credential Manifest
 */
export function buildSampleProcessApprovalManifest(
  attestationType: AttestationTypes,
  issuer: CredentialIssuer,
  styles: EntityStyle = {}
): CredentialManifest {
  const outputDescriptor = buildProcessApprovalOutputDescriptor(
    attestationType,
    issuer.name ? issuer.name : "Unknown Issuer",
    styles
  )

  return buildManifest(
    attestationToManifestId(attestationType),
    issuer,
    [outputDescriptor],
    proofOfControlPresentationDefinition()
  )
}

export function buildCreditScoreManifest(
  issuer: CredentialIssuer,
  styles: EntityStyle = {}
): CredentialManifest {
  const attestationInfo = getAttestionDefinition(
    AttestationTypes.CreditScoreAttestation
  )

  const outputDescriptor = buildCreditScoreOutputDescriptor(
    issuer.name ? issuer.name : "Unknown Issuer",
    attestationInfo.schema,
    styles
  )

  return buildManifest(
    attestationToManifestId(AttestationTypes.CreditScoreAttestation),
    issuer,
    [outputDescriptor],
    proofOfControlPresentationDefinition()
  )
}

export function buildHybridManifest(
  attestationType: AttestationTypes[],
  issuer: CredentialIssuer,
  styles: EntityStyle = {}
): CredentialManifest {
  // TOFIX: this doesn't handle all types
  const outputDescriptors = attestationType.map((a) => {
    if (a === AttestationTypes.CreditScoreAttestation) {
      return buildCreditScoreOutputDescriptor(
        issuer.name ? issuer.name : "Unknown Issuer",
        getAttestionDefinition(a).schema,
        styles
      )
    } else {
      return buildProcessApprovalOutputDescriptor(
        a,
        issuer.name ? issuer.name : "Unknown Issuer",
        styles
      )
    }
  })

  return buildHybridManifestWithOutputDescriptors(issuer, outputDescriptors)
}

export function buildHybridManifestWithOutputDescriptors(
  issuer: CredentialIssuer,
  outputDescriptors: OutputDescriptor[]
): CredentialManifest {
  return buildManifest(
    `${issuer.name} Hybrid Manifest`, // TOFIX: consider renaming from ODs
    issuer,
    outputDescriptors,
    proofOfControlPresentationDefinition()
  )
}

export function buildCreditScoreOutputDescriptor(
  issuerName: string,
  schema: string,
  styles: EntityStyle = {}
): OutputDescriptor {
  const outputDescriptor = new OutputDescriptorBuilder()
    .id(`${CREDIT_SCORE_CREDENTIAL_TYPE_NAME}`)
    .schema(schema)
    .name(`Proof of Credit Score from ${issuerName}`)
    .description(
      `Attestation that ${issuerName} has performed a Credit Score check for this subject`
    )
    .styles(styles)
    .withDisplay(`${issuerName} Risk Score`, (d) => {
      d.subtitle({
        path: [`$.${AttestationTypes.CreditScoreAttestation}.scoreType`],
        fallback: "Includes credit score"
      })
        .description(
          "The Credit Score authority processes credit worthiness analysis, potentially employing a number of internal and external vendor providers."
        )
        .addNumberProperty("Score", (p) =>
          p.path([`$.${AttestationTypes.CreditScoreAttestation}.score`])
        )
        .addStringProperty("Score Type", (p) =>
          p.path([`$.${AttestationTypes.CreditScoreAttestation}.scoreType`])
        )
        .addStringProperty("Provider", (p) =>
          p.path([`$.${AttestationTypes.CreditScoreAttestation}.provider`])
        )
    })
    .build()
  return outputDescriptor
}

export function buildProcessApprovalOutputDescriptor(
  attestationType: AttestationTypes,
  issuerName: string,
  styles: EntityStyle = {}
) {
  const attestationInfo = getAttestionDefinition(attestationType)

  const credentialType = attestationToCredentialType(attestationType)
  const outputDescriptor = new OutputDescriptorBuilder()
    .id(`${credentialType}`)
    .schema(attestationInfo.schema)
    .name(`${credentialType} from ${issuerName}`)
    .description(
      `Attestation that ${issuerName} has completed ${attestationType} verification for this subject`
    )
    .styles(styles)
    .withDisplay(`${issuerName} ${attestationType} Attestation`, (d) => {
      d.title(`${issuerName} ${attestationType}`)
        .subtitle({
          path: ["$.approvalDate", "$.vc.approvalDate"],
          fallback: "Includes date of approval"
        })
        .description(
          `The issuing authority processes ${attestationType} analysis, potentially employing a number of internal and external vendor providers.`
        )
        .addStringProperty("Process", (p) =>
          p.path([`$.${attestationType}.process`])
        )
        .addDateTimeProperty("Approved At", (p) =>
          p.path([`$.${attestationType}.approvalDate`])
        )
    })
    .build()
  return outputDescriptor
}
