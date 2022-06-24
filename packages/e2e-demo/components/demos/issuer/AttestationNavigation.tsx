import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { FC } from "react"

import { isActive, classNames } from "../../../lib/react-fns"

type Props = {
  hideNavigation?: boolean
}

const tabs = [
  { name: "KYC/AML", href: "/demos/issuer/kyc" },
  { name: "Credit Score", href: "/demos/issuer/credit-score" }
]

const AttestationNavigation: FC<Props> = ({ hideNavigation }) => {
  const { data: session } = useSession()

  return (
    <div
      className={classNames(
        hideNavigation
          ? "justify-end"
          : "justify-between flex-col-reverse sm:flex-row",
        "flex mb-6  border-b border-gray-200"
      )}
    >
      {!hideNavigation && (
        <nav className="flex -mb-px space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link key={tab.name} href={tab.href}>
              <a
                className={classNames(
                  isActive(tab.href)
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                  "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                )}
              >
                {tab.name}
              </a>
            </Link>
          ))}
        </nav>
      )}

      {session && (
        <div
          className={classNames(
            hideNavigation ? "w-full sm:w-auto" : "",
            "flex -mb-px space-x-8 justify-between"
          )}
        >
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
  )
}

export default AttestationNavigation
