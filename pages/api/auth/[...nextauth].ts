import NextAuth from "next-auth"
import Providers from "next-auth/providers"
import { authenticateUser } from "lib/database"

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
  ]
})
