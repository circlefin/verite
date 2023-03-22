import {
  CredentialResponseWrapper,
  MaybeCredential,
  JWT,
  W3CCredential,
  Verifiable
} from "../../types"
import { decodeAndVerifyJwtCredentials } from "../utils"

export async function decodeAndVerifyResponseCredentials(
  response: CredentialResponseWrapper<MaybeCredential>
): Promise<CredentialResponseWrapper<Verifiable<W3CCredential>>> {
  let decodedArray: Verifiable<W3CCredential>[] | undefined
  if (response.verifiableCredential) {
    // FOLLOW_UP: when we support formats other than JWT, we'll check the credential
    // manifest for the format and use the appropriate decoder
    decodedArray = await decodeAndVerifyJwtCredentials(
      response.verifiableCredential as JWT[]
    )
  }
  const responseWithDecodedCredentials = {
    credential_response: response.credential_response,
    ...(decodedArray !== undefined && { verifiableCredential: decodedArray })
  }
  return responseWithDecodedCredentials
}
