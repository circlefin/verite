import { AttestationTypes, Signer, JWT, StatusList2021Entry } from "../../types"
import { CredentialPayloadBuilder } from "../builders"
import { attestationToVCSchema, signVerifiableCredential } from "../utils"
import {
  buildProcessApprovalAttestation,
  buildSampleCreditScoreAttestation
} from "./attestations"
import { attestationToCredentialType } from "./constants-maps"

export async function buildProcessApprovalVC(
  attestationType: AttestationTypes,
  signer: Signer,
  subjectDid: string,
  credentialStatus?: StatusList2021Entry
): Promise<JWT> {
  const sampleAttestation = buildProcessApprovalAttestation(attestationType)

  const vc = new CredentialPayloadBuilder()
    .issuer(signer.did)
    .type(attestationToCredentialType(attestationType))
    .attestations(subjectDid, sampleAttestation)
    .credentialSchema(attestationToVCSchema(attestationType))
    .credentialStatus(credentialStatus)
    .build()

  const signedVc = signVerifiableCredential(vc, signer)

  return signedVc
}

export async function buildCreditScoreVC(
  signer: Signer,
  subjectDid: string,
  creditScore: number,
  credentialStatus?: StatusList2021Entry
): Promise<JWT> {
  const sampleAttestation = buildSampleCreditScoreAttestation(creditScore)

  const vc = new CredentialPayloadBuilder()
    .issuer(signer.did)
    .type(attestationToCredentialType(AttestationTypes.CreditScoreAttestation))
    .attestations(subjectDid, sampleAttestation)
    .credentialSchema(
      attestationToVCSchema(AttestationTypes.CreditScoreAttestation)
    )
    .credentialStatus(credentialStatus)
    .build()

  const signedVc = signVerifiableCredential(vc, signer)
  return signedVc
}
