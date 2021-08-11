import { signOut, useSession } from "next-auth/client"
import { FC } from "react"
import Header, { HeaderProps } from "../Header"

const Layout: FC<HeaderProps> = ({ children, ...headerProps }) => {
  const [session] = useSession()

  return (
    <>
      <div className="text-base antialiased text-black bg-white font-inter font-feature-default">
        <Header {...headerProps}>
          {session && (
            <div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-blue-700 hover:text-white"
              >
                Sign out
              </button>
            </div>
          )}
        </Header>
        <main className="-mt-32">
          <div className="max-w-3xl px-4 pb-12 mx-auto sm:px-6 lg:px-8">
            <div className="px-5 py-6 bg-white rounded-lg shadow sm:px-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default Layout
