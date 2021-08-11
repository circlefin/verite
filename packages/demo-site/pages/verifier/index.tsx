import { CalculatorIcon, UsersIcon } from "@heroicons/react/outline"
import { ChevronRightIcon } from "@heroicons/react/solid"
import { NextPage } from "next"
import Link from "next/link"
import IssuerLayout from "../../components/issuer/Layout"
import { requireAuth } from "../../lib/auth-fns"

const items = [
  {
    name: "KYC/AML Attestation",
    description:
      "Proof that your account has been verified and passed KYC/AML checks",
    href: "/verifier/kyc",
    iconColor: "bg-pink-500",
    icon: UsersIcon
  },
  {
    name: "Credit Score",
    description: "Proof of your current credit score.",
    href: "/verifier/credit-score",
    iconColor: "bg-purple-500",
    icon: CalculatorIcon
  }
]

const IssuerPage: NextPage = () => {
  return (
    <IssuerLayout title="Verifier" hideNavigation={true}>
      <div className="prose">
        <h2>Verify a Credential</h2>
        <p>Select the type of credential you would like to verify.</p>
      </div>
      <ul
        role="list"
        className="mt-6 border-t border-b border-gray-200 divide-y divide-gray-200"
      >
        {items.map((item, itemIdx) => (
          <li key={itemIdx}>
            <div className="relative flex items-start py-4 space-x-3 group hover:bg-gray-50">
              <div className="flex-shrink-0">
                <span
                  className={`${item.iconColor} inline-flex items-center justify-center h-10 w-10 rounded-lg`}
                >
                  <item.icon
                    className="w-6 h-6 text-white"
                    aria-hidden="true"
                  />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  <Link href={item.href}>
                    <a>
                      <span className="absolute inset-0" aria-hidden="true" />
                      {item.name}
                    </a>
                  </Link>
                </div>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <div className="self-center flex-shrink-0">
                <ChevronRightIcon
                  className="w-5 h-5 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </IssuerLayout>
  )
}

export default IssuerPage
