import { createVerifiableCredentialJwt } from "did-jwt-vc"
import type {
  CredentialPayload,
  Issuer,
  JWT,
  JwtCredentialPayload
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
