import {
  isRevocable,
  MaybeRevocableCredential,
  RevocableCredential,
  RevocationList2021Status,
  RevocationListCredential,
  MINIMUM_BITSTREAM_LENGTH,
  asyncMap,
  decodeVerifiableCredential,
  generateRevocationList,
  buildIssuer
} from "@centre/verity"
import { random, sample } from "lodash"
import { v4 as uuidv4 } from "uuid"
import { fullURL } from "../../lib/utils"
import { prisma, User, Credential } from "./prisma"
import { findUser } from "./users"

export type DecodedDatabaseCredential<T = MaybeRevocableCredential> =
  Credential & {
    credential: T
  }

/**
 *
 */
export const storeCredentials = async (
  credentials: Array<MaybeRevocableCredential>,
  userId: string
): Promise<void> => {
  await asyncMap(credentials, async (credential) => {
    await prisma.credential.create({
      data: {
        userId,
        jwt: credential.proof.jwt
      }
    })
  })
}

/**
 * Returns all revocation lists, optionally filtered by ones for a specific
 * host.
 *
 * @param host to filter by
 * @returns revocation lists filtered by host
 */
export const allRevocationLists = async (
  host: string = undefined
): Promise<RevocationListCredential[]> => {
  let options
  if (host) {
    options = { where: { host } }
  }
  const lists = await prisma.revocationList.findMany(options)

  // Create one if it doesn't exist.
  if (lists.length === 0) {
    const list = await generateRevocationList(
      [],
      fullURL(`/api/revocation/${uuidv4()}`),
      process.env.ISSUER_DID,
      buildIssuer(process.env.ISSUER_DID, process.env.ISSUER_SECRET)
    )
    await saveRevocationList(list)
    return [list]
  }

  return await asyncMap(lists, async (list) => {
    return (await decodeVerifiableCredential(
      list.jwt
    )) as RevocationListCredential
  })
}

/**
 *
 */
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

/**
 *
 */
export const findUserByCredential = async (
  jwt: string
): Promise<User | undefined> => {
  const data = await prisma.credential.findFirst({
    where: { jwt }
  })
  if (data) {
    const userId = data.userId
    const user = await findUser(userId)
    return user
  }
}

/**
 *
 */
export const findCredentialsByUserId = async (
  userId: string
): Promise<DecodedDatabaseCredential[]> => {
  const records = await prisma.credential.findMany({
    where: {
      userId
    }
  })

  return decodeDatabaseCredentials(records)
}

/**
 *
 */
export const findCredentialsByUserIdAndType = async (
  userId: string,
  type: string
): Promise<MaybeRevocableCredential[]> => {
  const credentials = (await findCredentialsByUserId(userId))
    .filter((credential) => credential.credential.type[1] === type)
    .map((c) => c.credential)

  return credentials
}

/**
 * Finds the newest credential. Useful for demo purposes.
 *
 * @param createdAt will restrict search to only credentials older than this date, defaults to epoch
 * @returns a decoded credential
 */
export const findNewestCredential = async (
  createdAt: Date = new Date(0)
): Promise<MaybeRevocableCredential | undefined> => {
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
    return decodeVerifiableCredential(result.jwt)
  }
}

/**
 *
 */
const findCredentialsByRevocationlist = async (
  revocationList: RevocationListCredential
): Promise<DecodedDatabaseCredential<RevocableCredential>[]> => {
  const records = await prisma.credential.findMany()
  const decoded = await decodeDatabaseCredentials(records)

  // Remove non-revocable credentials
  const revocable = decoded.filter(({ credential }) =>
    isRevocable(credential)
  ) as DecodedDatabaseCredential<RevocableCredential>[]

  return revocable.filter(
    ({ credential }) =>
      credential.credentialStatus.statusListCredential === revocationList.id
  )
}

/**
 *
 */
export const getRevocationListById = async (
  id: string
): Promise<RevocationListCredential | undefined> => {
  const list = await prisma.revocationList.findFirst({
    where: {
      id
    }
  })

  if (list) {
    return (await decodeVerifiableCredential(
      list.jwt
    )) as RevocationListCredential
  }
}

/**
 *
 */
export const saveRevocationList = async (
  revocationList: RevocationListCredential
): Promise<void> => {
  await prisma.revocationList.upsert({
    where: {
      id: revocationList.id
    },
    create: {
      id: revocationList.id,
      jwt: revocationList.proof.jwt,
      host: fullURL()
    },
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
    const lists = await allRevocationLists(fullURL())
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

async function decodeDatabaseCredentials(
  records: Credential[]
): Promise<DecodedDatabaseCredential[]> {
  return await asyncMap(records, async (record) => {
    const decoded = await decodeVerifiableCredential(record.jwt)

    return {
      ...record,
      credential: decoded
    }
  })
}
