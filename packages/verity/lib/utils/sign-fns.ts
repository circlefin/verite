import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt
} from "did-jwt-vc"
import type {
  CredentialPayload,
  Issuer,
  JWT,
  JwtCredentialPayload,
  JwtPresentationPayload,
  PresentationPayload
} from "../../types"

/**
 * Sign a VC and return a JWT
 */
export async function signVerifiableCredential(
  issuer: Issuer,
  vcPayload: JwtCredentialPayload | CredentialPayload
): Promise<JWT> {
  return createVerifiableCredentialJwt(vcPayload, issuer)
}

/**
 * Sign a VP and return a JWT
 */
export async function signVerifiablePresentation(
  issuer: Issuer,
  vcPayload: JwtPresentationPayload | PresentationPayload
): Promise<JWT> {
  return createVerifiablePresentationJwt(vcPayload, issuer)
}
