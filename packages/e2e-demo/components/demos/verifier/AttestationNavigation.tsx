import Link from "next/link"
import { FC } from "react"

import { isActive, classNames } from "../../../lib/react-fns"

const tabs = [
  { name: "KYC/AML", href: "/demos/verifier/kyc" },
  { name: "Credit Score", href: "/demos/verifier/credit-score" }
]

const AttestationNavigation: FC = () => {
  return (
    <div className="mb-6 border-b border-gray-200">
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
    </div>
  )
}

export default AttestationNavigation
