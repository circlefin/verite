import { ChevronRightIcon } from "@heroicons/react/solid"
import Link from "next/link"
import { FC } from "react"

import Layout from "../../components/shared/Layout"

const DEMOS = [
  {
    title: "Basic Issuance",
    href: "/demos/issuer",
    description:
      "An end-user requests KYC or Credit Score credentials from an issuer."
  },
  {
    title: "Basic Verification",
    href: "/demos/verifier",
    description: "An end-user submits a credential to a 3rd party verifier."
  },
  {
    title: "Compliance & Basic Revocation",
    href: "/demos/revocation",
    description:
      "A compliance officer revokes a previously-issued KYC credential."
  },
  {
    title: "Dapp Requiring KYC",
    href: "/demos/dapp",
    description:
      "An example of how a Dapp can prevent usage until it is provided with a valid KYC credential."
  },
  {
    title: "Lending Market Dapp Requiring KYC",
    href: "/demos/demo6",
    description:
      "An example of how a lending market Dapp can require KYC verification before depositing assets."
  },
  {
    title: "Centralized app with travel rule",
    href: "/demos/cefi",
    description:
      "An example of how a centralized service could satisfy Travel Rule requirements before performing a transaction."
  }
]

const DemosIndex: FC = () => {
  return (
    <Layout title="Demos">
      <ul role="list" className="divide-y divide-gray-200">
        {DEMOS.map((demo) => (
          <li key={demo.href}>
            <Link href={demo.href}>
              <a className="flex items-center justify-between p-4 space-x-4 hover:bg-gray-50">
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {demo.title}
                  </span>
                  <span className="text-sm text-gray-500">
                    {demo.description}
                  </span>
                </span>
                <ChevronRightIcon
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export default DemosIndex
