import { signOut, useSession } from "next-auth/client"
import { FC } from "react"
import Layout from "../Layout"

const RevocationLayout: FC = ({ children }) => {
  const [session] = useSession()

  return (
    <Layout title="Demo: Compliance &amp; Basic Revocation">
      <div className="mb-6 -mt-6 border-b border-gray-200">
        {session && (
          <div className="flex justify-between -mb-px space-x-8 sm:justify-end">
            <span className="px-1 py-4 text-sm font-medium text-gray-500 whitespace-nowrap ">
              {session.user.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-1 py-4 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
      {children}
    </Layout>
  )
}

export default RevocationLayout
