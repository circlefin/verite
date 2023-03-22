import { CredentialResponse, CredentialResponseWrapper, JWT } from "../../types"
import { Action } from "./common"
import { CredentialResponseBuilder } from "./credential-response-builder"

export class CredentialResponseWrapperBuilder<T> {
  _builder: Partial<CredentialResponseWrapper<T>>

  constructor() {
    this._builder = {}
  }

  withCredentialResponse(
    credentialResponseBuilder: Action<CredentialResponseBuilder>
  ): CredentialResponseWrapperBuilder<T> {
    const b = new CredentialResponseBuilder()
    credentialResponseBuilder(b)
    this._builder.credential_response = b.build()
    return this
  }

  credential_response(
    credential_response: CredentialResponse
  ): CredentialResponseWrapperBuilder<T> {
    this._builder.credential_response = credential_response
    return this
  }

  verifiableCredential(
    verifiableCredential: T | T[]
  ): CredentialResponseWrapperBuilder<T> {
    if (verifiableCredential) {
      if (this._builder.verifiableCredential === undefined) {
        this._builder.verifiableCredential = []
      }
      const vc = Array.isArray(verifiableCredential)
        ? verifiableCredential
        : [verifiableCredential]
      this._builder.verifiableCredential =
        this._builder.verifiableCredential.concat(vc)
    }
    return this
  }

  build(): CredentialResponseWrapper<T> {
    return this._builder as CredentialResponseWrapper<T>
  }
}
