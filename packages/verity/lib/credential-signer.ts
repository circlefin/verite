import { EdDSASigner } from "did-jwt"
import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt
} from "did-jwt-vc"
import {
  CredentialPayload,
  Issuer,
  JwtCredentialPayload,
  JwtPresentationPayload,
  PresentationPayload,
  JWT
} from "../types"

export class CredentialSigner {
  did: string
  signingConfig: Issuer
  constructor(did: string, secret: string) {
    this.did = did
    this.signingConfig = {
      did: did,
      alg: "EdDSA",
      signer: EdDSASigner(secret)
    }
  }

  /**
   * Sign a VC and return a JWT
   */
  async signVerifiableCredential(
    vcPayload: JwtCredentialPayload | CredentialPayload
  ): Promise<JWT> {
    return createVerifiableCredentialJwt(vcPayload, this.signingConfig)
  }

  /**
   * Sign a VP and return a JWT
   */
  async signVerifiablePresentation(
    vcPayload: JwtPresentationPayload | PresentationPayload
  ): Promise<JWT> {
    return createVerifiablePresentationJwt(vcPayload, this.signingConfig)
  }
}
