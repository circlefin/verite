import {
  CredentialApplication,
  CredentialApplicationWrapper
} from "../../types"
import { Action } from "./common"
import { CredentialApplicationBuilder } from "./credential-application-builder"

export class CredentialApplicationWrapperBuilder<T> {
  _builder: Partial<CredentialApplicationWrapper<T>>
  constructor() {
    this._builder = {}
  }

  credentialApplication(
    credentialApplication: CredentialApplication
  ): CredentialApplicationWrapperBuilder<T> {
    this._builder.credential_application = credentialApplication
    return this
  }

  withCredentialApplication(
    credentialApplicationBuilder: Action<CredentialApplicationBuilder>
  ): CredentialApplicationWrapperBuilder<T> {
    const b = new CredentialApplicationBuilder()
    credentialApplicationBuilder(b)
    this._builder.credential_application = b.build()
    return this
  }

  verifiableCredential(
    verifiableCredential?: T | T[]
  ): CredentialApplicationWrapperBuilder<T> {
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

  build(): CredentialApplicationWrapper<T> {
    return this._builder as CredentialApplicationWrapper<T>
  }
}
