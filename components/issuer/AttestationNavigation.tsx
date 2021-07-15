import Link from "next/link"
import { useRouter } from "next/router"
import { useActiveClass } from "lib/react-fns"

const tabs = [
  { name: "KYC/AML", href: "/attestations/kyc" },
  { name: "Credit Score", href: "/attestations/credit-score" }
]

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function AttestationNavigation() {
  const router = useRouter()
  const activeClass = useActiveClass(router)

  return (
    <div className="mb-6 -mt-6 border-b border-gray-200">
      <nav className="flex -mb-px space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <Link key={tab.name} href={tab.href}>
            <a
              className={activeClass(
                tab.href,
                "border-indigo-500 text-indigo-600",
                "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
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
