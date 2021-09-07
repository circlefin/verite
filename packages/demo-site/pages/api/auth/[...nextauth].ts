/* eslint-disable @typescript-eslint/ban-ts-comment */

import NextAuth from "next-auth"
import Providers from "next-auth/providers"
import { findUser, User } from "../../../lib/database"
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
      const user = await findUser(jwtUser.uid as string)

      if (!user) {
        return Promise.reject()
      }

      // @ts-ignore
      session.user.id = user.id
      // @ts-ignore
      session.user.address = user.address

      let name: string
      if (user.email === "alice@test.com") {
        name = "Alice Adams"
      } else if (user.email === "bob@test.com") {
        name = "Bob Benito"
      } else if (user.email === "kim@test.com") {
        name = "Kim Hamilton Duffy"
      } else if (user.email === "matt@test.com") {
        name = "Matt Venables"
      } else if (user.email === "brice@test.com") {
        name = "Brice Stacey"
      } else if (user.email === "sean@test.com") {
        name = "Sean Neville"
      }
      session.user.name = name
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
