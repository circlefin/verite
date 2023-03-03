import {
  PresentationPayload,
  PresentationSubmission,
  Verifiable,
  W3CCredential
} from "../../types"
import { VC_CONTEXT_URI } from "../utils"

export class PresentationPayloadBuilder {
  _builder: Partial<PresentationPayload>
  constructor() {
    this._builder = {
      "@context": [VC_CONTEXT_URI]
    }
  }

  id(id: string): PresentationPayloadBuilder {
    this._builder.id = id
    return this
  }

  type(type: string | string[]): PresentationPayloadBuilder {
    this._builder.type = type
    return this
  }

  verifiableCredential(
    verifiableCredential:
      | Verifiable<W3CCredential>
      | Verifiable<W3CCredential>[]
  ): PresentationPayloadBuilder {
    const vcJwtPayload = Array.isArray(verifiableCredential)
      ? verifiableCredential
      : [verifiableCredential]
    this._builder.verifiableCredential = vcJwtPayload
    return this
  }

  holder(holder: string): PresentationPayloadBuilder {
    this._builder.holder = holder
    return this
  }

  presentation_submission(
    presentation_submission: PresentationSubmission
  ): PresentationPayloadBuilder {
    this._builder.presentation_submission = presentation_submission
    return this
  }

  verifier(verifier: string | string[]): PresentationPayloadBuilder {
    this._builder.verifier = verifier
    return this
  }

  issuanceDate(issuanceDate: string): PresentationPayloadBuilder {
    this._builder.issuanceDate = issuanceDate
    return this
  }

  expirationDate(expirationDate: string): PresentationPayloadBuilder {
    this._builder.expirationDate = expirationDate
    return this
  }

  build(): PresentationPayload {
    return this._builder as PresentationPayload
  }
}
