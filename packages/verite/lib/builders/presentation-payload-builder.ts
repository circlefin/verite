import {
  JWT,
  PresentationPayload,
  PresentationSubmission,
  Verifiable,
  W3CCredential
} from "../../types"
import {
  PRESENTAION_SUBMISSION_TYPE_NAME,
  VC_CONTEXT_URI,
  VERIFIABLE_PRESENTATION_TYPE_NAME
} from "../utils"
import { Action } from "./common"
import { PresentationSubmissionBuilder } from "./presentation-submission-builder"

export class PresentationPayloadBuilder {
  _builder: Partial<PresentationPayload>
  constructor() {
    this._builder = {
      "@context": [VC_CONTEXT_URI],
      type: [
        VERIFIABLE_PRESENTATION_TYPE_NAME,
        PRESENTAION_SUBMISSION_TYPE_NAME
      ]
    }
  }

  id(id: string): PresentationPayloadBuilder {
    this._builder.id = id
    return this
  }

  // TOFIX: overwrite or filter?
  type(type: string | string[]): PresentationPayloadBuilder {
    this._builder.type = type
    return this
  }

  verifiableCredential(
    verifiableCredential:
      | Verifiable<W3CCredential>
      | Verifiable<W3CCredential>[]
      | JWT
      | JWT[]
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

  withPresentationSubmission(
    presentationPayloadBuilder: Action<PresentationSubmissionBuilder>
  ) {
    const b = new PresentationSubmissionBuilder()
    presentationPayloadBuilder(b)
    this._builder.presentation_submission = b.build()
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
