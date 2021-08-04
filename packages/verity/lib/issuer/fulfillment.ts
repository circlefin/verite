import { v4 as uuidv4 } from "uuid"
import type {
  DescriptorMap,
  EncodedCredentialFulfillment,
  GenericCredentialApplication,
  Issuer,
  JwtCredentialPayload,
  JWT,
  RevocationList2021Status,
  KYCAMLProvider,
  KYCAMLAttestation,
  CreditScore,
  DecodedCredentialApplication
} from "../../types"
import { asyncMap } from "../utils/async-fns"
import {
  creditScoreVerifiableCredentialPayload,
  kycAmlVerifiableCredentialPayload,
  verifiablePresentationPayload
} from "../utils/credentials"
import {
  signVerifiableCredential,
  signVerifiablePresentation
} from "../utils/sign-fns"
import { ProcessedCredentialApplication } from "../validators/ProcessedCredentialApplication"

async function buildAndSignFulfillment(
  signer: Issuer,
  application: GenericCredentialApplication,
  credentials: JwtCredentialPayload | JwtCredentialPayload[]
): Promise<EncodedCredentialFulfillment> {
  const credentialFulfillment = {
    id: uuidv4(),
    manifest_id: application.credential_application.manifest_id,
    descriptor_map:
      application.presentation_submission?.descriptor_map?.map<DescriptorMap>(
        (d, i) => {
          return {
            id: d.id,
            format: "jwt_vc",
            path: `$.presentation.credential[${i}]`
          }
        }
      ) || []
  }

  const jwtCredentials: JWT[] = await asyncMap<JwtCredentialPayload, JWT>(
    [credentials].flat(),
    (credential) => {
      return signVerifiableCredential(signer, credential)
    }
  )

  const presentation = await signVerifiablePresentation(
    signer,
    verifiablePresentationPayload(signer.did, jwtCredentials)
  )

  return {
    credential_fulfillment: credentialFulfillment,
    presentation
  }
}

export async function buildAndSignKycAmlFulfillment(
  signer: Issuer,
  acceptedApplication:
    | ProcessedCredentialApplication
    | DecodedCredentialApplication,
  credentialStatus: RevocationList2021Status,
  body: KYCAMLAttestation
): Promise<EncodedCredentialFulfillment> {
  const verifiablePresentation = acceptedApplication.presentation

  return buildAndSignFulfillment(
    signer,
    acceptedApplication,
    kycAmlVerifiableCredentialPayload(
      verifiablePresentation.holder,
      body,
      credentialStatus
    )
  )
}

export async function buildAndSignCreditScoreFulfillment(
  signer: Issuer,
  acceptedApplication:
    | ProcessedCredentialApplication
    | DecodedCredentialApplication,
  credentialStatus: RevocationList2021Status,
  creditScore: CreditScore
): Promise<EncodedCredentialFulfillment> {
  const verifiablePresentation = acceptedApplication.presentation

  return buildAndSignFulfillment(
    signer,
    acceptedApplication,
    creditScoreVerifiableCredentialPayload(
      verifiablePresentation.holder,
      creditScore,
      credentialStatus
    )
  )
}

// TODO(mv) allow custominzing the authority info (maybe superclass?)
export function kycAmlAttestation(
  serviceProviders?: KYCAMLProvider[]
): KYCAMLAttestation {
  return {
    "@type": "KYCAMLAttestation",
    authorityId: "did:web:verity.id",
    approvalDate: new Date().toJSON(),
    authorityName: "Verity",
    authorityUrl: "https://verity.id",
    authorityCallbackUrl: "https://identity.verity.id",
    serviceProviders: serviceProviders
  }
}
