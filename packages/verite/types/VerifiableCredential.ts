import { CredentialPayload, StatusList2021Entry } from "."

export type IdType = {
  id: string
  type: string
}

export type RefreshService = IdType

export type CredentialSchema = IdType

export type LatestCredentialPayload = CredentialPayload & {
  credentialSchema?: CredentialSchema
  refreshService?: RefreshService
  credentialStatus?: StatusList2021Entry

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evidence: any[]
}
