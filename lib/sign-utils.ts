import { EdDSASigner } from "did-jwt"
import {
  Issuer as DidJwtIssuer,
  createVerifiableCredentialJwt
} from "did-jwt-vc"
import { JWT } from "did-jwt-vc/lib/types"

const did = process.env.ISSUER_DID
const secret = process.env.ISSUER_SECRET

export const issuer: DidJwtIssuer = {
  did: did,
  alg: "EdDSA",
  signer: EdDSASigner(secret)
}

// TODO(kim): fix types
export const signVc = async (vcPayload: any): Promise<JWT> => {
  return createVerifiableCredentialJwt(vcPayload, issuer)
}
