import { AttestationTypes, DidKey, JWT, StatusList2021Entry } from "../../types"
import { CredentialPayloadBuilder } from "../builders"
import {
  buildIssuer,
  attestationToVCSchema,
  signVerifiableCredential
} from "../utils"
import {
  buildProcessApprovalAttestation,
  buildSampleCreditScoreAttestation
} from "./attestations"
import { attestationToCredentialType } from "./constants-maps"

export async function buildProcessApprovalVC(
  attestationType: AttestationTypes,
  issuerKey: DidKey,
  subjectDid: string,
  credentialStatus?: StatusList2021Entry
): Promise<JWT> {
  const signer = buildIssuer(issuerKey.subject, issuerKey.privateKey)
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
  issuerKey: DidKey,
  subjectDid: string,
  creditScore: number,
  credentialStatus?: StatusList2021Entry
): Promise<JWT> {
  const signer = buildIssuer(issuerKey.subject, issuerKey.privateKey)
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
