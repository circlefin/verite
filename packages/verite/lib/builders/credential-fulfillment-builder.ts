import { DecodedCredentialFulfillment } from "../../types"

export class CredentialFulfillmentBuilder {
  _builder: Partial<DecodedCredentialFulfillment>

  constructor() {
    this._builder = {}
  }
}
