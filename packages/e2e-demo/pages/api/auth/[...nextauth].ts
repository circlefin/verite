/* eslint-disable @typescript-eslint/ban-ts-comment */

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import { findUser, authenticateUser } from "../../../lib/database"

type Credentials = {
  csrfToken: string
  email: string
  password: string
}

export default NextAuth({
  providers: [
    CredentialsProvider({
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
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      const user = await findUser(token.sub as string)

      if (!user) {
        return Promise.reject()
      }

      session.user.id = user.id
      session.user.address = user.address
      session.user.fullName = user.fullName

      return Promise.resolve(session)
    }
  }
})
