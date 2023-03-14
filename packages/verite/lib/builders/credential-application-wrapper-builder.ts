import {
  CredentialApplication,
  CredentialApplicationWrapper,
  JWT
} from "../../types"
import {
  CREDENTIAL_APPLICATION_TYPE_NAME,
  VC_CONTEXT_URI,
  VERIFIABLE_PRESENTATION_TYPE_NAME
} from "../utils"
import { Action } from "./common"
import { CredentialApplicationBuilder } from "./credential-application-builder"

export class CredentialApplicationWrapperBuilder {
  _builder: Partial<CredentialApplicationWrapper>
  constructor() {
    this._builder = {
      "@context": [VC_CONTEXT_URI],
      type: [
        VERIFIABLE_PRESENTATION_TYPE_NAME,
        CREDENTIAL_APPLICATION_TYPE_NAME
      ]
    }
  }

  credentialApplication(credentialApplication: CredentialApplication) {
    this._builder.credential_application = credentialApplication
    return this
  }

  withCredentialApplication(
    credentialApplicationBuilder: Action<CredentialApplicationBuilder>
  ) {
    const b = new CredentialApplicationBuilder()
    credentialApplicationBuilder(b)
    this._builder.credential_application = b.build()
    return this
  }

  verifiableCredential(verifiableCredential?: JWT | JWT[]) {
    if (verifiableCredential) {
      const vcJwtPayload = Array.isArray(verifiableCredential)
        ? verifiableCredential
        : [verifiableCredential] // TOFIX: necessary?
      this._builder.verifiableCredential = vcJwtPayload
    }
    return this
  }

  build() {
    return this._builder as CredentialApplicationWrapper
  }
}
