
import { createJWT, decodeJWT, EdDSASigner, verifyJWT, JWTHeader } from "did-jwt"
import {
  createVerifiableCredentialJwt,
  JwtPresentationPayload,
  PresentationPayload, 
  Issuer, 
  transformPresentationInput,
  VerifiedPresentation,
  W3CPresentation,
  Verifiable
} from "did-jwt-vc"
import { DEFAULT_JWT_PROOF_TYPE, JWT_ALG } from "did-jwt-vc/lib/constants"
import { asArray, normalizeCredential, notEmpty } from "did-jwt-vc/lib/converters"
import { CreateCredentialOptions, CreatePresentationOptions, JWT, VerifyPresentationOptions} from "did-jwt-vc/lib/types"

const did = process.env.ISSUER_DID
const secret = process.env.ISSUER_SECRET

export const issuer: Issuer = {
  did: did,
  alg: "EdDSA",
  signer: EdDSASigner(secret)
}


function deepCopy<T>(source: T): T {
  return Array.isArray(source)
    ? source.map((item) => deepCopy(item))
    : source instanceof Date
    ? new Date(source.getTime())
    : source && typeof source === 'object'
    ? Object.getOwnPropertyNames(source).reduce((o, prop) => {
        Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(source, prop) as NonNullable<PropertyDescriptor>)
        o[prop] = deepCopy(source[prop as keyof T])
        return o
      }, Object.create(Object.getPrototypeOf(source)))
    : (source as T)
}

type DeepPartial<T> = T extends Record<string, unknown> ? { [K in keyof T]?: DeepPartial<T[K]> } : T

// TODO(kim): fix types
export const signVc = async (vcPayload: any): Promise<JWT> => {
  return createVerifiableCredentialJwt(vcPayload, issuer)
}

export async function createVerifiablePresentationJwt(
  payload: JwtPresentationPayload | PresentationPayload,
  holder: Issuer,
  options: CreatePresentationOptions = {}
): Promise<JWT> {
  const parsedPayload: JwtPresentationPayload = {
    iat: undefined,
    ...transformPresentationInput(payload, options?.removeOriginalFields),
  }

  // add challenge to nonce
  if (options.challenge && Object.getOwnPropertyNames(parsedPayload).indexOf('nonce') === -1) {
    parsedPayload.nonce = options.challenge
  }

  // add domain to audience.
  if (options.domain) {
    const audience = [...asArray(options.domain), ...asArray(parsedPayload.aud)].filter(notEmpty)
    //parsedPayload.aud = [...new Set(audience)]
    parsedPayload.aud = audience
  }

  return createJWT(
    parsedPayload,
    {
      issuer: holder.did || parsedPayload.iss || '',
      signer: holder.signer,
    },
    {
      ...options.header,
      alg: holder.alg || options.header?.alg || JWT_ALG,
    }
  )
}

function normalizeJwtPresentationPayload(
  input: DeepPartial<JwtPresentationPayload>,
  removeOriginalFields = true
): W3CPresentation {
  const result: Partial<PresentationPayload> = deepCopy(input)

  result.verifiableCredential = [
    ...asArray(input.verifiableCredential),
    ...asArray(input.vp?.verifiableCredential),
  ].filter(notEmpty)
  result.verifiableCredential = result.verifiableCredential.map((cred) => {
    return normalizeCredential(cred, removeOriginalFields)
  })
  if (removeOriginalFields) {
    delete result.vp?.verifiableCredential
  }

  if (input.iss && !input.holder) {
    result.holder = input.iss
    if (removeOriginalFields) {
      delete result.iss
    }
  }

  if (input.aud) {
    result.verifier = [...asArray(input.verifier), ...asArray(input.aud)].filter(notEmpty)
    //result.verifier = [...new Set(result.verifier)]
    if (removeOriginalFields) {
      delete result.aud
    }
  }

  if (input.jti && Object.getOwnPropertyNames(input).indexOf('id') === -1) {
    result.id = input.id || input.jti
    if (removeOriginalFields) {
      delete result.jti
    }
  }

  const types = [...asArray(input.type), ...asArray(input.vp?.type)].filter(notEmpty)
  result.type = types //[...new Set(types)]
  if (removeOriginalFields) {
    delete result.vp?.type
  }

  const contexts = [
    ...asArray(input.context),
    ...asArray(input['@context']),
    ...asArray(input.vp?.['@context']),
  ].filter(notEmpty)
  result['@context'] = contexts //[...new Set(contexts)]
  if (removeOriginalFields) {
    delete result.context
    delete result.vp?.['@context']
  }

  if (!input.issuanceDate && (input.iat || input.nbf)) {
    result.issuanceDate = new Date((input.nbf || input.iat) * 1000).toISOString()
    if (removeOriginalFields) {
      if (input.nbf) {
        delete result.nbf
      } else {
        delete result.iat
      }
    }
  }

  if (!input.expirationDate && input.exp) {
    result.expirationDate = new Date(input.exp * 1000).toISOString()
    if (removeOriginalFields) {
      delete result.exp
    }
  }

  if (result.vp && Object.keys(result.vp).length === 0) {
    if (removeOriginalFields) {
      delete result.vp
    }
  }

  return result as W3CPresentation
}

function normalizeJwtPresentation(input: JWT, removeOriginalFields = true): Verifiable<W3CPresentation> {
  let decoded
  try {
    decoded = decodeJWT(input)
  } catch (e) {
    throw new TypeError('unknown presentation format')
  }
  return {
    ...normalizeJwtPresentationPayload(decoded.payload, removeOriginalFields),
    proof: {
      type: DEFAULT_JWT_PROOF_TYPE,
      jwt: input,
    },
  }
}

export function normalizePresentation(
  input: Partial<PresentationPayload> | DeepPartial<JwtPresentationPayload> | JWT,
  removeOriginalFields = true
): Verifiable<W3CPresentation> {
  if (typeof input === 'string') {
     return normalizeJwtPresentation(input, removeOriginalFields)

  } else if (input.proof?.jwt) {
    // TODO: test that it correctly propagates app specific proof properties
    return { ...normalizeJwtPresentation(input.proof.jwt, removeOriginalFields), proof: input.proof }
  } else {
    // TODO: test that it accepts JWT payload, PresentationPayload, VerifiablePresentation
    // TODO: test that it correctly propagates proof, if any
    return { proof: {}, ...normalizeJwtPresentationPayload(input, removeOriginalFields) }
  }
}

export async function verifyPresentation(
  presentation: JWT,
  resolver: any,
  options: VerifyPresentationOptions = {}
): Promise<VerifiedPresentation> {
  const verified: Partial<VerifiedPresentation> = await verifyJWT(presentation, { resolver, ...options })
  //verifyPresentationPayloadOptions(verified.payload as JwtPresentationPayload, options)
  verified.verifiablePresentation = normalizePresentation(verified.jwt as string, options?.removeOriginalFields)
  //validatePresentationPayload(verified.verifiablePresentation)
  return verified as VerifiedPresentation
}