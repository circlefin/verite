import { LockClosedIcon } from "@heroicons/react/outline"
import { FC, useState } from "react"
import Cookies from "universal-cookie"
import { PASSWORD_PROTECTION_COOKIE } from "../../lib/react-fns"

type Props = {
  passwordSuccessful: boolean
}

/**
 * This layout should be used on all pages and provides a minimal
 * password protection system.
 */
const RequirePassword: FC<Props> = ({ children, passwordSuccessful }) => {
  const [password, setPassword] = useState("")

  return (
    <>
      {passwordSuccessful ? (
        children
      ) : (
        <form className="flex items-center justify-center h-screen mx-auto">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LockClosedIcon
                    className="w-5 h-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="block w-full pl-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center w-full px-4 py-2 my-2 text-sm font-medium text-center text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={(e) => {
                  e.preventDefault()
                  const cookies = new Cookies()
                  cookies.set(PASSWORD_PROTECTION_COOKIE, password)
                  window.location.reload()
                }}
              >
                Login
              </button>
            </div>
          </div>
        </form>
      )}
    </>
  )
}

export default RequirePassword
