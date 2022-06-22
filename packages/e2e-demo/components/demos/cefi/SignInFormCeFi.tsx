import { signIn } from "next-auth/react"
import { FC, useState } from "react"

import { LoadingButton } from "../../shared/LoadingButton"

type SampleUser = {
  email: string
  password: string
}

type Props = {
  redirectTo?: string
  users: SampleUser[]
  logo: JSX.Element
}

const SignInFormCeFi: FC<Props> = ({ logo, redirectTo, users }) => {
  const [currentLoadingUser, setCurrentLoadingUser] = useState<SampleUser>(null)

  const signInAs = (sampleUser: SampleUser) => {
    setCurrentLoadingUser(sampleUser)
    signIn("credentials", {
      email: sampleUser.email,
      password: sampleUser.password,
      callbackUrl: redirectTo
    })
  }

  return (
    <div className="max-w-sm p-6 mx-auto mt-6 space-y-6 border-2 rounded-md">
      <div className="mb-4">{logo}</div>
      <span className="px-2 text-lg text-gray-800">Log in as:</span>
      <div className="grid gap-4 sm:grid-cols-2">
        {users.map((sampleUser) => (
          <LoadingButton
            key={sampleUser.email}
            loading={currentLoadingUser === sampleUser}
            onClick={() => {
              signInAs(sampleUser)
            }}
            className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            {sampleUser.email}
          </LoadingButton>
        ))}
      </div>
    </div>
  )
}

export default SignInFormCeFi
