import { Verifiable, W3CCredential } from "did-jwt-vc"

export type RevocationList2021Status = {
  id: string
  type: "RevocationList2021Status"
  statusListIndex: string
  statusListCredential: string
}

export type Revocable<T> = T & {
  readonly credentialStatus: RevocationList2021Status
}

export type RevocableCredential = Revocable<Verifiable<W3CCredential>>
