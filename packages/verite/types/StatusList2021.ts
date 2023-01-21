import { JWT } from "./Jwt"

import type { Verifiable, W3CCredential, W3CPresentation } from "./DidJwt"

export type StatusList2021Entry = {
  id: string
  type: "StatusList2021Entry"
  statusPurpose: string
  statusListIndex: string
  statusListCredential: string
}

export type StatusList2021Subject = {
  id: string
  type: "StatusList2021"
  statusPurpose: string
  encodedList: string
}

export type Revocable<T> = T & {
  readonly credentialStatus: StatusList2021Entry
}

export type RevocableCredential = Revocable<Verifiable<W3CCredential>>

export type MaybeRevocableCredential =
  | Verifiable<W3CCredential>
  | RevocableCredential

export type RevocablePresentation = Verifiable<W3CPresentation> & {
  verifiableCredential?: RevocableCredential[]
}

export type StatusList<T> = T & {
  id: string
  readonly credentialSubject: StatusList2021Subject
}

export type StatusList2021Credential = StatusList<Verifiable<W3CCredential>>
export type EncodedStatusListCredential = JWT
