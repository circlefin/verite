import {
  JwtPresentationPayload,
  createVerifiablePresentationJwt,
  Verifiable,
  W3CCredential
} from "did-jwt-vc"
import { DidKey, didKeyToIssuer, createPresentationSubmission } from "./verity"

export const createVerificationPayload = async (
  didKey: DidKey,
  presentation: any,
  credential: Verifiable<W3CCredential>
): Promise<any> => {
  const payload: JwtPresentationPayload = {
    vp: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation"],
      verifiableCredential: [credential]
    }
  }

  const client = didKeyToIssuer(didKey)
  const jwt = await createVerifiablePresentationJwt(payload, client)

  const submission = await createPresentationSubmission(
    didKey,
    presentation.presentation_definition,
    jwt
  )
  return submission
}

export const requestVerification = async (
  didKey: DidKey,
  presentation: any,
  credential: Verifiable<W3CCredential>
): Promise<any> => {
  const body = await createVerificationPayload(didKey, presentation, credential)
  const url = presentation.request.reply_url

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
