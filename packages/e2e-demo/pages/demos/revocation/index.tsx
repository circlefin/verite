import { NextPage } from "next"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState } from "react"

import RevocationLayout from "../../../components/demos/revocation/Layout"
import { LoadingButton } from "../../../components/shared/LoadingButton"
import { fullURL } from "../../../lib/utils"

const RevocationPage: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const signInAsCompliance = () => {
    setIsLoading(true)

    if (session) {
      // Already signed in, move to the compliance UI
      router.push("/demos/revocation/dashboard")
    } else {
      signIn("credentials", {
        email: "alice@test.com",
        password: "testing",
        callbackUrl: fullURL("/demos/revocation/dashboard")
      })
    }
  }

  return (
    <RevocationLayout hideAuth>
      <div className="pb-2 prose max-w-none">
        <h2>Simulating an Issuer&apos;s Compliance Tool</h2>
        <p>
          This example simulates an admin tool used by issuers to manage
          credentials. Such a tool might be used by a compliance analyst to
          inspect the details of a user, including all credentials issued to a
          user, and to revoke credentials if needed.
        </p>

        <p>
          In order to use this tool, you must first sign in as a compliance
          officer.
        </p>

        <LoadingButton
          loading={isLoading}
          onClick={() => {
            signInAsCompliance()
          }}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Log in as Compliance Officer
        </LoadingButton>
      </div>
    </RevocationLayout>
  )
}

export default RevocationPage
