/* eslint-disable @typescript-eslint/ban-ts-comment */

import NextAuth from "next-auth"
import Providers from "next-auth/providers"

import { findUser, User, authenticateUser } from "../../../lib/database"

type Credentials = {
  csrfToken: string
  email: string
  password: string
}

export default NextAuth({
  providers: [
    Providers.Credentials({
      name: "Demo App",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Credentials) {
        return authenticateUser(credentials.email, credentials.password)
      }
    })
  ],
  session: { jwt: true },
  callbacks: {
    async session(session, jwtUser) {
      const user = await findUser(jwtUser.uid as string)

      if (!user) {
        return Promise.reject()
      }

      session.user.id = user.id
      session.user.address = user.address
      session.user.fullName = user.fullName

      return Promise.resolve(session)
    },
    jwt: async (token, user?: User) => {
      if (user) {
        token.uid = user.id
      }
      return Promise.resolve(token)
    }
  }
})
