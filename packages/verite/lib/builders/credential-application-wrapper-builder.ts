import {
  CredentialApplication,
  CredentialApplicationWrapper,
  JWT
} from "../../types"
import { Action } from "./common"
import { CredentialApplicationBuilder } from "./credential-application-builder"

export class CredentialApplicationWrapperBuilder {
  _builder: Partial<CredentialApplicationWrapper>
  constructor() {
    this._builder = {}
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

  build() {
    return this._builder as CredentialApplicationWrapper
  }
}
