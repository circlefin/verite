import { signIn } from "next-auth/client"
import { FC, useState } from "react"

type Props = {
  redirectTo?: string
}

const SignInForm: FC<Props> = ({ redirectTo }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const emailSignin = (e) => {
    e.preventDefault()
    signIn("credentials", { email, password, callbackUrl: redirectTo })
  }

  const signInAs = (email: string, password = "testing") => {
    signIn("credentials", { email, password, callbackUrl: redirectTo })
  }

  return (
    <form
      className="max-w-sm mx-auto mt-6 space-y-6"
      method="POST"
      onSubmit={emailSignin}
    >
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Email address
        </label>
        <div className="mt-1">
          <input
            type="email"
            autoComplete="email"
            required
            autoFocus={true}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:placeholder-gray-200 dark:border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Password
        </label>
        <div className="mt-1">
          <input
            type="password"
            autoComplete="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none dark:placeholder-gray-200 dark:border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign in
        </button>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-gray-500 bg-white">or sign in as</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => signInAs("alice@test.com")}
          className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Alice (Admin)
        </button>
        <button
          onClick={() => signInAs("bob@test.com")}
          className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Bob
        </button>
      </div>
    </form>
  )
}

export default SignInForm
