import {
  generateRevocationList,
  isRevocable,
  RevocableCredential,
  RevocationList2021Status,
  RevocationListCredential
} from "@centre/verity"
import { findIndex, random, sample } from "lodash"
import { credentialSigner } from "lib/signer"

export type DatabaseCredential = {
  userId: string
  credential: RevocableCredential
}

const MINIMUM_BITSTREAM_LENGTH = 16 * 1_024 * 8 // 16KB
const REVOCATION_LISTS: RevocationListCredential[] = []
const CREDENTIALS: DatabaseCredential[] = []

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
    if (!isRevocable(credential)) {
      return
    }

    CREDENTIALS.push({
      userId,
      credential
    })
  })
}

export const allRevocationLists = async (): Promise<
  RevocationListCredential[]
> => {
  await setupIfNecessary()

  return REVOCATION_LISTS
}

export const findCredentialsByUserId = async (
  userId: string
): Promise<DatabaseCredential[]> => {
  await setupIfNecessary()

  return CREDENTIALS.filter((c) => c.userId === userId)
}

export const getRevocationListById = async (
  id: string
): Promise<RevocationListCredential> => {
  await setupIfNecessary()
  return REVOCATION_LISTS.find((list) => list.id === id)
}

export const saveRevocationList = async (
  revocationList: RevocationListCredential
): Promise<void> => {
  const index = findIndex(REVOCATION_LISTS, (list) => {
    return list.id === revocationList.id
  })

  if (index !== -1) {
    REVOCATION_LISTS.splice(index, 1)
  }

  REVOCATION_LISTS.push(revocationList)
}

/**
 * Each revocable credential requires that we provide it a unique index in a list.
 */
export const pickListAndIndex = async (): Promise<RevocationList2021Status> => {
  await setupIfNecessary()

  // Pick a random revocation list
  const revocationList = sample(REVOCATION_LISTS)

  // Find all credentials in the revocation list and map the index
  const consumedIndexes = CREDENTIALS.filter(
    ({ credential }) =>
      credential.credentialStatus.statusListCredential === revocationList.id
  ).map(({ credential }) =>
    parseInt(credential.credentialStatus.statusListIndex, 10)
  )

  // Try up to 10 times for now
  for (let i = 0; i < MINIMUM_BITSTREAM_LENGTH; i++) {
    const randomIndex = random(0, MINIMUM_BITSTREAM_LENGTH - 1)
    const index = consumedIndexes.indexOf(randomIndex)
    if (index === -1) {
      return {
        id: `${revocationList.id}#${randomIndex}`,
        type: "RevocationList2021Status",
        statusListIndex: randomIndex.toString(),
        statusListCredential: revocationList.id
      }
    }
  }
}
