import { useSession, signout } from "next-auth/client"
import { FC } from "react"
import { useBalance } from "../../hooks/useBalance"
import Header, { HeaderProps } from "../Header"

type Props = HeaderProps

const Layout: FC<Props> = ({ children, ...headerProps }) => {
  const [session] = useSession()
  const { data } = useBalance()

  return (
    <div className="text-base antialiased text-black bg-white font-inter font-feature-default">
      <Header {...headerProps} />
      <main className="-mt-32">
        <div className="max-w-4xl px-4 pb-12 mx-auto sm:px-6 lg:px-8">
          <div className="px-5 py-6 overflow-hidden bg-white rounded-lg shadow sm:px-6">
            <div className="flex flex-col-reverse justify-between mb-6 -mt-6 border-b border-gray-200 sm:flex-row">
              <nav
                className="flex justify-center -mb-px space-x-8"
                aria-label="Tabs"
              >
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

            <div className="max-w-2xl mx-auto">{children}</div>
          </div>
          <div className="pt-8 prose-sm text-center">
            <p className="text-gray-500 font-extralight">
              &copy;2021 Centre | Software open sourced under the MIT license
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Layout
