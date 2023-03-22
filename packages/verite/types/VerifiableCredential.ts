import {
  CredentialPayload,
  JWT,
  StatusList2021Entry,
  Verifiable,
  W3CCredential
} from "."

export type RefreshService = {
  id: string
  type: string
}

export type CredentialSchema = {
  id: string
  type: string
}

export type CredentialPayload_v1_1 = CredentialPayload & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  "@context": string | string[] | any[]
  credentialSchema?: CredentialSchema
  refreshService?: RefreshService
  credentialStatus?: StatusList2021Entry

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evidence: any[]
}

export type MaybeCredential = JWT | Verifiable<W3CCredential>
