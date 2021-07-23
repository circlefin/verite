import {
  generateRevocationList,
  RevocableCredential,
  RevocationList2021Status
} from "@centre/verity"
import { Verifiable, W3CCredential } from "did-jwt-vc"
import { random, sample } from "lodash"
import { credentialSigner } from "../signer"
const REVOCATION_LISTS: Verifiable<W3CCredential>[] = []
const CREDENTIALS: Verifiable<W3CCredential>[] = []

// Generate a default revocation list credential when the app starts
const setupIfNecessary = async () => {
  if (REVOCATION_LISTS.length !== 0) {
    return
  }
  const url = process.env.REVOCATION_URL
  REVOCATION_LISTS.push(
    await generateRevocationList([], url, process.env.ISSUER, credentialSigner)
  )
}

export const storeRevocableCredential = (
  credentials: RevocableCredential[],
  userId: string
): void => {
  credentials.forEach((credential) => {
    if (!credential.credentialStatus) {
      return
    }

    const credentialType = credential.type[1]
    const index = credential.credentialStatus.statusListIndex
    const statusList = credential.credentialStatus.statusListCredential

    /**
     * At bare minimum, we need to persist:
     * 1. Internal Customer Id
     * 2. Credential Type
     * 3. Index of the credential
     * 4. Which status list the index is in
     */
    CREDENTIALS.push({
      userId,
      credentialType,
      index,
      statusList
    })
  })
}

/**
 * Each revocable credential requires that we provide it a unique index in a list.
 */
export const pickListAndIndex = async (): Promise<RevocationList2021Status> => {
  await setupIfNecessary()

  // Pick a random revocation list
  const list = sample(REVOCATION_LISTS)

  // Find all credentials in the revocation list and map the index
  const consumedIndexes = CREDENTIALS.filter((credential) => {
    credential.statusList === list.verifiableCredential.vc.id
  }).map((credential) => credential.index)

  // Try up to 10 times for now
  for (let i = 0; i < 131072; i++) {
    const randomIndex = random(0, 131071) // 131072 - 1
    const index = consumedIndexes.indexOf(randomIndex)
    if (index === -1) {
      return {
        id: `${list.verifiableCredential.vc.id}#list`,
        type: "RevocationList2021Status",
        statusListIndex: randomIndex.toString(),
        statusListCredential: `${list.verifiableCredential.vc.id}`
      }
    }
  }
}
