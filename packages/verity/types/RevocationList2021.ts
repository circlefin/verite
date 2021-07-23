import { Verifiable, W3CCredential } from "./W3C"

export type RevocationList2021Status = {
  id: string
  type: "RevocationList2021Status"
  statusListIndex: string
  statusListCredential: string
}

export type RevocationList2021Subject = {
  id: string
  type: "RevocationList2021"
  encodedList: string
}

export type Revocable<T> = T & {
  readonly credentialStatus: RevocationList2021Status
}

export type RevocableCredential = Revocable<Verifiable<W3CCredential>>

export type RevocationList<T> = T & {
  readonly credentialSubject: RevocationList2021Subject
}

export type RevocationListCredential = RevocationList<Verifiable<W3CCredential>>
