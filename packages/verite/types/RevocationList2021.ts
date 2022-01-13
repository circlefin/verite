import type { Verifiable, W3CCredential, W3CPresentation } from "./DidJwt"

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

export type MaybeRevocableCredential =
  | Verifiable<W3CCredential>
  | RevocableCredential

export type RevocablePresentation = Verifiable<W3CPresentation> & {
  verifiableCredential?: RevocableCredential[]
}

export type RevocationList<T> = T & {
  id: string
  readonly credentialSubject: RevocationList2021Subject
}

export type RevocationListCredential = RevocationList<Verifiable<W3CCredential>>
