import {
  CredentialIssuer,
  CredentialManifest,
  EntityStyle,
  AttestationTypes,
  OutputDescriptor,
  PresentationDefinition
} from "../../types"
import { buildManifest, OutputDescriptorBuilder } from "../builders"
import { getAttestionDefinition } from "../utils"
import { CREDIT_SCORE_CREDENTIAL_TYPE_NAME } from "./constants"
import {
  attestationToCredentialType,
  attestationToManifestId
} from "./constants-maps"

/**
 * Generate a Credential Manifest for the specified attestation.
 *
 * @param attestationType The type of attestation to generate a manifest for
 * @param issuer The issuer for the credential
 * @param presentation_definition An optional presentation definition describing
 * the requirements for the credential. This is used if issuers require callers/
 * wallets to submit credentials that meet certain requirements before issuing
 * the credential.
 * @param styles An optional list of styles to use for the credential
 *
 * @returns a Credential Manifest
 */
export function buildSampleProcessApprovalManifest(
  attestationType: AttestationTypes,
  issuer: CredentialIssuer, // TOFIX: rename
  styles: EntityStyle = {},
  presentation_definition?: PresentationDefinition // TOFIX: ensure we have test coverage for this path
): CredentialManifest {
  const outputDescriptor = buildProcessApprovalOutputDescriptor(
    attestationType,
    issuer.name ?? issuer.id,
    styles
  )

  return buildManifest(
    attestationToManifestId(attestationType),
    issuer,
    [outputDescriptor],
    presentation_definition
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
    issuer.name ?? issuer.id,
    attestationInfo.schema,
    styles
  )

  return buildManifest(
    attestationToManifestId(AttestationTypes.CreditScoreAttestation),
    issuer,
    [outputDescriptor]
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
        issuer.name ?? issuer.id,
        getAttestionDefinition(a).schema,
        styles
      )
    } else {
      return buildProcessApprovalOutputDescriptor(
        a,
        issuer.name ?? issuer.id,
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
    `${issuer.name ?? issuer.id} Hybrid Manifest`, // TOFIX: consider renaming from ODs
    issuer,
    outputDescriptors
  )
}

/**
 * Demonstrates how to build a sample OutputDescriptor for a Credential
 * Manifest with a Credit Score credential output descriptor.
 *
 * This is an example only; not normative.
 * @param issuerName The issuer name, which will be used in output
 * descriptor fields below. These might then be used by a wallet
 * consuming the manifest for display purposes.
 * @param schema The schema for the credential
 * @param styles An optional list of styles for the wallet to use
 * @returns an OutputDescriptor
 */
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

/**
 * Demonstrates how to build a sample OutputDescriptor for a Credential
 * Manifest with a Process Approval credential output descriptor.
 *
 * Examples of process approvals include:
 * - KYC / KYBP
 * - Accredited Investor / Accredited Entity
 *
 * This is an example only; not normative.
 * @param issuerName The issuer name, which will be used in output
 * descriptor fields below. These might then be used by a wallet
 * consuming the manifest for display purposes.
 * @param schema The schema for the credential
 * @param styles An optional list of styles for the wallet to use
 * @returns an OutputDescriptor
 */
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
