import { Attestation, CredentialPayload } from "../../types"
import { VERIFIABLE_CREDENTIAL_TYPE_NAME } from "../utils"
import { DEFAULT_CONTEXT } from "./common"

export class CredentialPayloadBuilder {
  _builder: Partial<CredentialPayload>
  _additionalPayload: Partial<CredentialPayload> = {}

  constructor() {
    this._builder = Object.assign({
      "@context": DEFAULT_CONTEXT
    })
  }

  type(type: string | string[]) {
    // append all types other than "Verifiable Credential", which we always include
    const finalCredentialTypes = [VERIFIABLE_CREDENTIAL_TYPE_NAME].concat(
      Array.isArray(type)
        ? type.filter((c) => c !== VERIFIABLE_CREDENTIAL_TYPE_NAME)
        : type !== VERIFIABLE_CREDENTIAL_TYPE_NAME
        ? [type]
        : []
    )
    this._builder.type = finalCredentialTypes
    return this
  }

  attestations(subjectDid: string, attestation: Attestation | Attestation[]) {
    // For attestations, preserve the array or object structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let attsns: any[] | any
    if (Array.isArray(attestation)) {
      attsns = attestation.map((att) => {
        return {
          id: subjectDid,
          [att["type"].toString()]: att
        }
      })
    } else {
      attsns = {
        id: subjectDid,
        [attestation["type"].toString()]: attestation
      }
    }
    this._builder.credentialSubject = attsns
    return this
  }

  issuer(issuerDid: string) {
    this._builder.issuer = { id: issuerDid }
    return this
  }

  additionalPayload(additionalPayload: Partial<CredentialPayload>) {
    this._additionalPayload = additionalPayload
    return this
  }

  build(): CredentialPayload {
    this._builder.issuanceDate = new Date()
    this._builder = Object.assign(this._builder, this._additionalPayload)
    return this._builder as CredentialPayload
  }
}
