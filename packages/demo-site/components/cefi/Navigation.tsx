import { useSession, signout } from "next-auth/client"
import { FC } from "react"
import { useBalance } from "../../hooks/useBalance"

const Layout: FC = () => {
  const [session] = useSession()
  const { data } = useBalance()

  return (
    <>
      <div className="flex flex-col-reverse justify-between mb-6 -mt-6 border-b border-gray-200 sm:flex-row">
        <nav className="flex justify-center -mb-px space-x-8" aria-label="Tabs">
          <span className="px-1 py-4 text-sm font-medium text-gray-500 whitespace-nowrap ">
            Balance:
            <span className="ml-3 text-lg font-bold">
              {data?.balance} VUSDC
            </span>
          </span>
        </nav>
        {session ? (
          <div className="flex justify-between -mb-px space-x-8">
            <span className="flex items-center px-1 py-4 text-sm font-medium text-gray-500 whitespace-nowrap">
              {session?.user?.email}
            </span>
            <button
              onClick={() => signout()}
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
