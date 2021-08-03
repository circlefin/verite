import type {
  RevocableCredential,
  RevocationList2021Status,
  RevocationListCredential
} from "@centre/verity"
import {
  MINIMUM_BITSTREAM_LENGTH,
  asyncMap,
  decodeVerifiableCredential,
  isRevocable
} from "@centre/verity"
import { random, sample } from "lodash"
import { prisma } from "./prisma"

export type DatabaseCredential = {
  userId: string
  credential: RevocableCredential
}

export const storeRevocableCredential = async (
  credentials: RevocableCredential[],
  userId: string
): Promise<void> => {
  await asyncMap(credentials, async (credential) => {
    if (!isRevocable(credential)) {
      return
    }

    await prisma.credential.create({
      data: {
        userId,
        jwt: credential.proof.jwt
      }
    })
  })
}

export const allRevocationLists = async (): Promise<
  RevocationListCredential[]
> => {
  const lists = await prisma.revocationList.findMany()

  return await asyncMap(lists, async (list) => {
    return (await decodeVerifiableCredential(
      list.jwt
    )) as RevocationListCredential
  })
}

export const findRevocationListForCredential = async (
  credential: RevocableCredential
): Promise<RevocationListCredential | undefined> => {
  if (!credential.credentialStatus) {
    return
  }

  const url = credential.credentialStatus.statusListCredential
  const revocationLists = await allRevocationLists()
  return revocationLists.find((list) => list.id === url)
}

export const findCredentialsByUserId = async (
  userId: string
): Promise<DatabaseCredential[]> => {
  const result = await prisma.credential.findMany({
    where: {
      userId
    }
  })

  return await asyncMap(result, async (r) => {
    return {
      userId: r.userId,
      credential: (await decodeVerifiableCredential(
        r.jwt
      )) as RevocableCredential
    }
  })
}

/**
 * Finds the newest credential. Useful for demo purposes.
 *
 * @param createdAt will restrict search to only credentials older than this date, defaults to epoch
 * @returns a decoded credential
 */
export const findNewestCredential = async (
  createdAt: Date = new Date(0)
): Promise<RevocableCredential | undefined> => {
  const result = await prisma.credential.findFirst({
    where: {
      createdAt: {
        gt: createdAt
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })
  if (result) {
    return (await decodeVerifiableCredential(result.jwt)) as RevocableCredential
  }
}

const findCredentialsByRevocationlist = async (
  revocationList: RevocationListCredential
): Promise<DatabaseCredential[]> => {
  const results = await prisma.credential.findMany()

  return (
    await asyncMap(results, async (r) => {
      return {
        userId: r.userId,
        credential: (await decodeVerifiableCredential(
          r.jwt
        )) as RevocableCredential
      }
    })
  ).filter(
    ({ credential }) =>
      credential.credentialStatus.statusListCredential === revocationList.id
  )
}

export const getRevocationListById = async (
  id: string
): Promise<RevocationListCredential> => {
  const list = await prisma.revocationList.findFirst({
    where: {
      id
    }
  })
  return (await decodeVerifiableCredential(
    list.jwt
  )) as RevocationListCredential
}

export const saveRevocationList = async (
  revocationList: RevocationListCredential
): Promise<void> => {
  await prisma.revocationList.upsert({
    where: {
      id: revocationList.id
    },
    create: { id: revocationList.id, jwt: revocationList.proof.jwt },
    update: { id: revocationList.id, jwt: revocationList.proof.jwt }
  })
}

/**
 * Select a random revocation list and a random index from that list
 * to store the revocation status.
 *
 * Each revocable credential requires that we provide it a unique index in a list.
 *
 * @returns a revocation list status containing a list and index
 */
export const generateRevocationListStatus =
  async (): Promise<RevocationList2021Status> => {
    // Pick a random revocation list
    const lists = await allRevocationLists()
    const revocationList = sample(lists)

    // Find all credentials in the revocation list and map the index
    const consumedIndexes = (
      await findCredentialsByRevocationlist(revocationList)
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
