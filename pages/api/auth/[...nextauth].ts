import NextAuth from "next-auth"
import Providers from "next-auth/providers"
import { authenticateUser, User } from "lib/database"

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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      session.user.id = jwtUser.uid
      return Promise.resolve(session)
    },
    jwt: async (token, user: User) => {
      if (user) {
        token.uid = user.id
      }
      return Promise.resolve(token)
    }
  }
})
