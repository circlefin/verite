import { StatusList2021Entry } from "../../types/StatusList2021"

export const revocationListFixture: StatusList2021Entry = {
  id: "http://example.com/revocation-list#42",
  type: "StatusList2021Entry",
  statusPurpose: "revocation",
  statusListIndex: "42",
  statusListCredential: "http://example.com/revocation-list"
}
