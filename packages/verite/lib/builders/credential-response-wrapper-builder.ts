import { CredentialResponse, CredentialResponseWrapper, JWT } from "../../types"
import {
  CREDENTIAL_RESPONSE_TYPE_NAME,
  VC_CONTEXT_URI,
  VERIFIABLE_PRESENTATION_TYPE_NAME
} from "../utils"
import { Action } from "./common"
import { CredentialResponseBuilder } from "./credential-response-builder"

export class CredentialResponseWrapperBuilder {
  _builder: Partial<CredentialResponseWrapper>

  constructor() {
    this._builder = {
      "@context": [VC_CONTEXT_URI],
      type: [VERIFIABLE_PRESENTATION_TYPE_NAME, CREDENTIAL_RESPONSE_TYPE_NAME]
    }
  }

  withCredentialResponse(
    credentialResponseBuilder: Action<CredentialResponseBuilder>
  ) {
    const b = new CredentialResponseBuilder()
    credentialResponseBuilder(b)
    this._builder.credential_response = b.build()
    return this
  }

  credentialResponse(credentialResponse: CredentialResponse) {
    this._builder.credential_response = credentialResponse
    return this
  }

  verifiableCredential(verifiableCredential: JWT | JWT[]) {
    const vcJwtPayload = Array.isArray(verifiableCredential)
      ? verifiableCredential
      : [verifiableCredential]

    this._builder.verifiableCredential = vcJwtPayload
    return this
  }

  build() {
    return this._builder as CredentialResponseWrapper
  }
}
