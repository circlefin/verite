import { CredentialResponse, CredentialResponseWrapper, JWT } from "../../types"
import { Action } from "./common"
import { CredentialResponseBuilder } from "./credential-response-builder"

export class CredentialResponseWrapperBuilder {
  _builder: Partial<CredentialResponseWrapper>

  constructor() {
    this._builder = {}
  }

  withCredentialResponse(
    credentialResponseBuilder: Action<CredentialResponseBuilder>
  ): CredentialResponseWrapperBuilder {
    const b = new CredentialResponseBuilder()
    credentialResponseBuilder(b)
    this._builder.credential_response = b.build()
    return this
  }

  credential_response(
    credential_response: CredentialResponse
  ): CredentialResponseWrapperBuilder {
    this._builder.credential_response = credential_response
    return this
  }

  verifiableCredential(
    verifiableCredential: JWT | JWT[]
  ): CredentialResponseWrapperBuilder {
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

  build(): CredentialResponseWrapper {
    return this._builder as CredentialResponseWrapper
  }
}
