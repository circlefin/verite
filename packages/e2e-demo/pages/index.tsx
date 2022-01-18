import {
  BadgeCheckIcon,
  IdentificationIcon,
  BriefcaseIcon,
  InboxInIcon
} from "@heroicons/react/outline"
import { NextPage } from "next"
import Image from "next/image"
import Link from "next/link"
import Layout from "../components/shared/Layout"

/**
 * The Home page, available at "/".
 *
 * This page is a `NextPage`, which is a React Functional Component.
 */
const Home: NextPage = () => {
  return (
    <Layout title="Decentralized Identity for Crypto Finance.">
      <p className="mx-auto mb-8 text-xl text-gray-500 max-w-prose">
        Verite defines data models, protocol recipes, and open source software
        that links identity proofs to crypto finance experiences.
      </p>

      <Image
        src="/img/sequence-overview.png"
        width="1180"
        height="380"
        alt="Overview Sequence"
      />

      <div className="my-8">
        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
          {/* Issue */}
          <div className="relative">
            <dt>
              <div className="absolute flex items-center justify-center w-12 h-12 text-white bg-blue-500 rounded-md">
                <InboxInIcon
                  className="w-6 h-6 text-white"
                  aria-hidden="true"
                />
              </div>
              <h3 className="ml-16 text-lg font-medium leading-6 text-gray-900">
                Issue
              </h3>
            </dt>
            <dd className="mt-2 ml-16 text-base text-gray-500">
              <p className="">
                Identities are defined by traits called <i>claims</i>. One
                identity can attest to the authenticity and correctness of
                another identity&apos;s claims by issuing a cryptographic{" "}
                <a
                  href="https://www.w3.org/TR/vc-data-model/"
                  target="_blank"
                  className="font-semibold hover:underline"
                  rel="noreferrer"
                >
                  Verifiable Credential
                </a>
                .
              </p>
              <p className="mt-5 italic">
                For example, a university might issue a Verifiable Credential
                that cryptographically proves an individual&apos;s graduation
                claim.
              </p>
            </dd>
          </div>

          {/* Custody */}
          <div className="relative">
            <dt>
              <div className="absolute flex items-center justify-center w-12 h-12 text-white bg-blue-500 rounded-md">
                <BriefcaseIcon
                  className="w-6 h-6 text-white"
                  aria-hidden="true"
                />
              </div>
              <h3 className="ml-16 text-lg font-medium leading-6 text-gray-900">
                Custody
              </h3>
            </dt>
            <dd className="mt-2 ml-16 text-base text-gray-500">
              People and institutions &mdash; the <i>subjects</i> of the
              credentials &mdash; custody their Verifiable Credentials in
              wallets just as they hold their own USDC and other crypto assets.
              Subjects may &quot;self-custody&quot; or rely on a trusted host to
              custody their credentials. The custodian is also called the{" "}
              <i>holder</i>.
            </dd>
          </div>

          {/* Verify */}
          <div className="relative">
            <dt>
              <div className="absolute flex items-center justify-center w-12 h-12 text-white bg-blue-500 rounded-md">
                <BadgeCheckIcon
                  className="w-6 h-6 text-white"
                  aria-hidden="true"
                />
              </div>
              <h3 className="ml-16 text-lg font-medium leading-6 text-gray-900">
                Verify
              </h3>
            </dt>

            <dd className="mt-2 ml-16 text-base text-gray-500">
              <p className="">
                People, institutions, and smart contracts can verify credentials
                without accessing the private information used in the issuance
                of the claim and without leaking information to the issuer.
                Verite implements{" "}
                <a
                  href="https://identity.foundation/presentation-exchange/"
                  target="_blank"
                  className="font-semibold hover:underline"
                  rel="noreferrer"
                >
                  Presentation Exchange
                </a>{" "}
                as its verification protocol.
              </p>
              <p className="mt-5 italic">
                For example, an employer can verify that a job candidate has
                graduated from a specific university without accessing age or
                graduation date, and without contacting the university.
              </p>
            </dd>
          </div>

          {/* Identify */}
          <div className="relative">
            <dt>
              <div className="absolute flex items-center justify-center w-12 h-12 text-white bg-blue-500 rounded-md">
                <IdentificationIcon
                  className="w-6 h-6 text-white"
                  aria-hidden="true"
                />
              </div>
              <h3 className="ml-16 text-lg font-medium leading-6 text-gray-900">
                Identify
              </h3>
            </dt>
            <dd className="mt-2 ml-16 text-base text-gray-500">
              Issuers, subjects, and verifiers of credentials are identified by
              unique Decentralized Identifiers, or{" "}
              <a
                href="https://www.w3.org/TR/did-core/"
                target="_blank"
                className="font-semibold hover:underline"
                rel="noreferrer"
              >
                DIDs
              </a>
              . DIDs leverage public-private key cryptography similarly to
              blockchain addresses. Just as in the physical world where
              individuals have several context-sensitive identities, in the
              virtual world people may have several DIDs, each with distinct
              credentials.
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <Link href="/demos">
          <a className="flex items-center justify-center w-full px-4 py-2 pt-4 pb-4 font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm text-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <BadgeCheckIcon className="mr-2 -ml-1 w-7 h-7" aria-hidden="true" />
            View the Demos
          </a>
        </Link>
      </div>
    </Layout>
  )
}

export default Home
