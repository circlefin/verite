import { v4 as uuidv4 } from "uuid"

import { CredentialApplicationHeader, JWT } from "../../types"
import {
  CREDENTIAL_APPLICATION_TYPE_NAME,
  VC_CONTEXT_URI,
  VERIFIABLE_PRESENTATION_TYPE_NAME
} from "../utils"
import { Action } from "./common"
import { CredentialApplicationBuilder } from "./credential-application-builder"

export type CredentialApplicationWrapper = {
  "@context": string | string[]
  type: string | string[]
  credential_application: CredentialApplicationHeader // TOFIX: is this the right type?
  verifiableCredential: JWT | JWT[]
}

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

  credentialApplication(credentialApplication: CredentialApplicationHeader) {
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
    // TOOD: CHECK NULL-NESS
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
