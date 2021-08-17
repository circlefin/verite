import { signOut, useSession } from "next-auth/client"
import Link from "next/link"
import { FC } from "react"
import { HeaderProps } from "../Header"
import BaseLayout from "./BaseLayout"

const UserAuthLayout: FC<HeaderProps> = ({ children, ...headerProps }) => {
  const [session] = useSession()

  const authSection = (
    <>
      {session ? (
        <div className="flex">
          <span className="hidden px-3 py-3 text-sm font-medium text-gray-300 rounded-md sm:block">
            {session.user.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-blue-700 hover:text-white"
          >
            Sign out
          </button>
        </div>
      ) : (
        <Link href={`/signin`}>
          <a className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-blue-700 hover:text-white">
            Sign in
          </a>
        </Link>
      )}
    </>
  )

  return (
    <BaseLayout authSection={authSection} {...headerProps}>
      {children}
    </BaseLayout>
  )
}

export default UserAuthLayout
