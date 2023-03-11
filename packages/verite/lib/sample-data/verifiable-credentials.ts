import { AttestationTypes, DidKey, JWT } from "../../types"
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
  credentialStatus?: any
): Promise<JWT> {
  const signer = buildIssuer(issuerKey.subject, issuerKey.privateKey)
  const sampleAttestation = buildProcessApprovalAttestation(attestationType)

  const vc = await composeVerifiableCredential(
    signer,
    subjectDid,
    sampleAttestation,
    attestationToCredentialType(attestationType),
    {
      credentialSchema: attestationToVCSchema(attestationType),
      ...credentialStatus
    }
  )
  return vc
}

export async function buildCreditScoreVC(
  issuerKey: DidKey,
  subjectDid: string,
  creditScore: number,
  credentialStatus?: any // TODO
): Promise<JWT> {
  const signer = buildIssuer(issuerKey.subject, issuerKey.privateKey)
  const sampleAttestation = buildSampleCreditScoreAttestation(creditScore)

  const vc = await composeVerifiableCredential(
    signer,
    subjectDid,
    sampleAttestation,
    attestationToCredentialType(AttestationTypes.CreditScoreAttestation),
    {
      credentialSchema: attestationToVCSchema(
        AttestationTypes.CreditScoreAttestation
      ),
      ...credentialStatus
    }
  )
  return vc
}
