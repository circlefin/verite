import { JWTOptions } from "did-jwt"

import {
  CredentialApplication,
  CredentialManifest,
  CredentialResponseWrapper,
  DecodedCredentialResponseWrapper,
  Signer,
  JWT
} from "../../types"
import { CredentialApplicationWrapperBuilder } from "../builders"
import { CredentialResponseWrapperBuilder } from "../builders/credential-response-wrapper-builder"
import { decodeJWT2, verifyJWT2, verifyVerifiableCredential } from "../utils"

import { signVeriteJwt } from "."

// TOFIX: where does this live and is it useful? Does it neeed more params?
export async function composeCredentialResponse(
  application: Partial<CredentialApplication>,
  manifest: CredentialManifest,
  signer: Signer,
  vc: JWT | JWT[]
): Promise<JWT> {
  const credentialResponse = new CredentialResponseWrapperBuilder()
    .withCredentialResponse((r) => {
      r.initFromApplication(application)
      r.initFromManifest(manifest)
    })
    .verifiableCredential(vc)
    .build()

  const responseJwt = await signVeriteJwt(credentialResponse, signer)
  return responseJwt
}

// TOFIX: ditto above?
export async function composeCredentialApplication(
  manifest: CredentialManifest,
  signer: Signer,
  verifiableCredential?: JWT | JWT[]
): Promise<JWT> {
  const application = new CredentialApplicationWrapperBuilder()
    .withCredentialApplication((a) => {
      a.initFromManifest(manifest)
      a.applicant(signer.did)
    })
    .verifiableCredential(verifiableCredential)
    .build()

  const responseJwt = await signVeriteJwt(application, signer)
  return responseJwt
}

export async function decodeAndVerifyCredentialResponseJwt(
  credentialResponseJwt: JWT,
  options?: JWTOptions
): Promise<DecodedCredentialResponseWrapper> {
  // TOFIX: does verify do both???
  const result = await decodeJWT2(credentialResponseJwt)
  const result2 = await verifyJWT2(credentialResponseJwt, options)
  const credentialResponse = result.payload as CredentialResponseWrapper
  let decodedArray
  if (credentialResponse.verifiableCredential) {
    decodedArray = await Promise.all(
      credentialResponse.verifiableCredential.map((vc) =>
        verifyVerifiableCredential(vc)
      )
    )
  }
  //
  // TOdo: options?

  const decodedCredentialResponse = {
    credential_response: credentialResponse.credential_response,
    ...(decodedArray !== undefined && { verifiableCredential: decodedArray })
  }

  return decodedCredentialResponse
}
