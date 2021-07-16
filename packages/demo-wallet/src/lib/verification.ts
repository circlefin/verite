import {
  JwtPresentationPayload,
  createVerifiablePresentationJwt,
  Verifiable,
  W3CCredential
} from "did-jwt-vc"
import { didKeyToIssuer } from "./verity/didKey"
import { DidKey } from "./verity/types"

export const createVerificationPayload = async (
  didKey: DidKey,
  credential: Verifiable<W3CCredential>
): Promise<any> => {
  const client = didKeyToIssuer(didKey)

  const payload: JwtPresentationPayload = {
    vp: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation"],
      verifiableCredential: [credential]
    }
  }

  return await createVerifiablePresentationJwt(payload, client)
}

export const requestVerification = async (
  didKey: DidKey,
  url: string,
  credential: Verifiable<W3CCredential>
): Promise<any> => {
  const body = await createVerificationPayload(didKey, credential)

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })

  if (response.status === 200) {
    const json = await response.json()
    return json
  } else {
    console.log(response.status, await response.text())
  }
}
