import { Verifiable, W3CCredential } from "did-jwt-vc"
import { DidKey, createPresentationSubmission } from "./verity"

export const submitVerification = async (
  didKey: DidKey,
  presentation: any,
  credential: Verifiable<W3CCredential>
): Promise<any> => {
  const body = await createPresentationSubmission(
    didKey,
    presentation.presentation_definition,
    credential
  )
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
