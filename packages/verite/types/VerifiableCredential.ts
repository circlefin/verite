import { CredentialPayload, PresentationPayload, StatusList2021Entry } from "."

export type RefreshService = {
  id: string
  type: string
}

export type CredentialSchema = {
  id: string
  type: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContextType = string | string[] | any[]

// TODO: name
export type LatestCredentialPayload = CredentialPayload & {
  "@context": ContextType
  credentialSchema?: CredentialSchema
  refreshService?: RefreshService
  credentialStatus?: StatusList2021Entry

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evidence: any[]
}

// TODO: name
export type LatestPresentationPayload = Omit<PresentationPayload, "holder"> & {
  holder?: string
}
