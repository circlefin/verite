import { EdDSASigner } from 'did-jwt'
import { Issuer as DidJwtIssuer, createVerifiableCredentialJwt } from 'did-jwt-vc'

// TODO(kim): fix types
export const signVc = async (vcPayload: any): Promise<any> => {
  const did = process.env.ISSUER_DID
  const secret = process.env.ISSUER_SECRET

  const myIssuer : DidJwtIssuer = {
    did: did,
    alg: "EdDSA",
    signer: EdDSASigner(
      secret
    )
  }

  return createVerifiableCredentialJwt(vcPayload, myIssuer)
}