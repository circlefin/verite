import { Wallet } from "ethers"
import { v4 as uuidv4 } from "uuid"
import { prisma, User } from "../../lib/database"

export async function userFactory(opts?: Partial<User>): Promise<User> {
  const email = `${uuidv4()}@test.com`
  const wallet = Wallet.createRandom()

  return prisma.user.create({
    data: {
      email,
      mnemonic: wallet.mnemonic.phrase,
      address: wallet.address,
      ...opts
    }
  })
}
