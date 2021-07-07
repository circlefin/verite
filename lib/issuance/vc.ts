import { EdDSASigner } from 'did-jwt'
import { Issuer, createVerifiableCredentialJwt } from 'did-jwt-vc'
import { parseJwk } from 'jose/jwk/parse'

const secret = {
  "kty": "OKP",
  "crv": "Ed25519",
  "x": "uKBzC90m8bp7_mpgqdMJFNihhAdbk_cRyoXKvgZ05qo",
  "d": "xnx_w4pAsivO6PtWNG7ZU9lsc0H8MsnQ83O-r22WrEk"
};

const myIssuer : Issuer = {
  did: process.env.ISSUER_DID,
  signer: EdDSASigner(
    parseJwk(secret) // TODO
  )  
}

const vcPayload: any = {}

export const generateVC = (): Promise<any> => {
  return createVerifiableCredentialJwt(vcPayload, myIssuer)
}