/* eslint-disable @typescript-eslint/ban-ts-comment */

import NextAuth from "next-auth"
import Providers from "next-auth/providers"
import { allUsers, User } from "../../../lib/database"
import { authenticateUser } from "../../../lib/database"

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
      // @ts-ignore
      session.user.id = jwtUser.uid
      // @ts-ignore
      session.user.role = jwtUser.role
      return Promise.resolve(session)
    },
    jwt: async (token, user: User) => {
      if (user) {
        token.uid = user.id
        token.role = user.role
      }
      return Promise.resolve(token)
    }
  }
})
