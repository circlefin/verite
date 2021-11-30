import { prisma } from "./prisma"

export async function authenticate(password?: string): Promise<boolean> {
  if (!password || !password.length) {
    return false
  }

  const demoAccount = await prisma.demoAccount.findMany({
    where: {
      password
    },
    take: 1
  })

  if (demoAccount.length) {
    await prisma.demoAccount.update({
      where: {
        id: demoAccount[0].id
      },
      data: {
        lastLoginAt: new Date(),
        loginCount: demoAccount[0].loginCount + 1
      }
    })

    return true
  }

  return false
}
