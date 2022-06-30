import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import { FC } from "react"

import { useBalance } from "../../../hooks/useBalance"

const logoForSession = (session): JSX.Element => {
  const coinboss = ["bob@test.com", "kim@test.com", "brice@test.com"]
  const circle = ["alice@test.com", "sean@test.com", "matt@test.com"]

  if (coinboss.includes(session?.user?.email)) {
    return (
      <Image
        height="26px"
        width="145px"
        alt="Coinboss Logo"
        src="/img/logo-coinboss.png"
      />
    )
  } else if (circle.includes(session?.user?.email)) {
    return (
      <Image
        height="26px"
        width="186px"
        alt="Trapezoid Logo"
        src="/img/logo-trapezoid.png"
      />
    )
  } else {
    return undefined
  }
}

const Layout: FC = () => {
  const { data: session } = useSession()
  const { data, accountBalance } = useBalance()

  const logo = logoForSession(session)

  return (
    <>
      <div className="flex flex-col-reverse justify-between mb-6 border-b border-gray-200 sm:flex-row">
        <nav
          className="flex justify-center -mb-px space-x-8 sm:w-1/3"
          aria-label="Tabs"
        >
          <span className="px-1 py-4 text-sm font-medium text-gray-500 whitespace-nowrap ">
            {data ? (
              <>
                Balance:
                <span className="ml-3 text-lg font-bold">
                  {accountBalance.toString()} VUSDC
                </span>
              </>
            ) : (
              <div className="text-lg font-bold">&nbsp;</div>
            )}
          </span>
        </nav>
        {logo ? (
          <div className="flex items-center justify-center sm:w-1/3">
            {logo}
          </div>
        ) : null}
        {session ? (
          <div className="flex justify-end -mb-px space-x-8 sm:w-1/3">
            <span className="flex items-center px-1 py-4 text-sm font-medium text-gray-500 whitespace-nowrap">
              {session?.user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="px-1 py-4 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
            >
              Sign Out
            </button>
          </div>
        ) : null}
      </div>
    </>
  )
}

export default Layout
