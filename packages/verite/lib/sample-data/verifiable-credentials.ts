import {
  AttestationTypes,
  CredentialPayload,
  DidKey,
  JWT,
  StatusList2021Entry
} from "../../types"
import { composeVerifiableCredential } from "../issuer"
import { buildIssuer, attestationToVCSchema } from "../utils"
import {
  buildProcessApprovalAttestation,
  buildSampleCreditScoreAttestation
} from "./attestations"
import { attestationToCredentialType } from "./constants-maps"

export async function buildProcessApprovalVC(
  attestationType: AttestationTypes,
  issuerKey: DidKey,
  subjectDid: string,
  credentialStatus?: StatusList2021Entry | null
): Promise<JWT> {
  const signer = buildIssuer(issuerKey.subject, issuerKey.privateKey)
  const sampleAttestation = buildProcessApprovalAttestation(attestationType)

  const additionalPayload: Partial<CredentialPayload> = {
    credentialSchema: attestationToVCSchema(attestationType)
  }
  if (credentialStatus) {
    additionalPayload["credentialStatus"] = credentialStatus
  }

  const vc = await composeVerifiableCredential(
    signer,
    subjectDid,
    sampleAttestation,
    attestationToCredentialType(attestationType),
    additionalPayload
  )
  return vc
}

export async function buildCreditScoreVC(
  issuerKey: DidKey,
  subjectDid: string,
  creditScore: number,
  credentialStatus?: StatusList2021Entry | null
): Promise<JWT> {
  const signer = buildIssuer(issuerKey.subject, issuerKey.privateKey)
  const sampleAttestation = buildSampleCreditScoreAttestation(creditScore)
  const additionalPayload: Partial<CredentialPayload> = {
    credentialSchema: attestationToVCSchema(
      AttestationTypes.CreditScoreAttestation
    )
  }
  if (credentialStatus) {
    additionalPayload["credentialStatus"] = credentialStatus
  }

  const vc = await composeVerifiableCredential(
    signer,
    subjectDid,
    sampleAttestation,
    attestationToCredentialType(AttestationTypes.CreditScoreAttestation),
    additionalPayload
  )
  return vc
}
