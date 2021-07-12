import { EdDSASigner } from "did-jwt"
import { Issuer, createVerifiableCredentialJwt } from "did-jwt-vc"

const did = process.env.ISSUER_DID
const secret = Buffer.from(process.env.ISSUER_SECRET, "hex")

export const issuer: Issuer = {
  did: did,
  alg: "EdDSA",
  signer: EdDSASigner(secret)
}

// TODO(kim): fix types
export const signVc = async (vcPayload: any): Promise<any> => {
  return createVerifiableCredentialJwt(vcPayload, issuer)
}
