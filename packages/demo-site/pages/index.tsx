import {
  BadgeCheckIcon,
  IdentificationIcon,
  BriefcaseIcon,
  InboxInIcon
} from "@heroicons/react/outline"
import { NextPage } from "next"
import Image from "next/image"
import Link from "next/link"
import Layout from "../components/Layout"

const Home: NextPage = () => {
  return (
    <Layout title="Decentralized Identity for Crypto Finance.">
      <p className="mx-auto mb-8 text-xl text-gray-500 max-w-prose">
        Verity defines data models, protocol recipes, and open source software
        that links identity proofs to crypto finance experiences.
      </p>

      <Image
        src="/img/sequence-overview.png"
        width="1180"
        height="380"
        alt="Overview Sequence"
      />

      <div className="mt-8 text-center">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {/* Issue */}
          <div className="pt-6">
            <div className="flow-root px-6 pb-8 rounded-lg bg-gray-50">
              <div className="-mt-6">
                <div className="text-center">
                  <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                    <InboxInIcon
                      className="w-6 h-6 text-white"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-medium tracking-tight text-gray-900">
                  Issue
                </h3>
                <p className="mt-5 text-base text-gray-500">
                  Identities are defined by traits called <i>claims</i>. One
                  identity can attest to the authenticity and correctness of
                  another identity&apos;s claims by issuing a cryptographic{" "}
                  <Link href="https://www.w3.org/TR/vc-data-model/">
                    <a target="_blank" className="font-bold">
                      Verifiable Credential
                    </a>
                  </Link>
                </p>
                <p className="mt-5 text-base italic text-gray-500">
                  For example, a university might issue a Verifiable Credential
                  that cryptographically proves an individual&apos;s graduation
                  claim.
                </p>
              </div>
            </div>
          </div>

          {/* Custody */}
          <div className="pt-6">
            <div className="flow-root px-6 pb-8 rounded-lg bg-gray-50">
              <div className="-mt-6">
                <div className="text-center">
                  <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                    <BriefcaseIcon
                      className="w-6 h-6 text-white"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-medium tracking-tight text-gray-900">
                  Custody
                </h3>
                <p className="mt-5 text-base text-gray-500">
                  People and institutions &mdash; the <i>subjects</i> of the
                  credentials &mdash; custody their Verifiable Credentials in
                  wallets just as they hold their own USDC and other crypto
                  assets. Subjects may &quot;self-custody&quot; or rely on a
                  trusted host to custody their credentials. The custodian is
                  also called the <i>holder</i>.
                </p>
              </div>
            </div>
          </div>

          {/* Verify */}
          <div className="pt-6">
            <div className="flow-root px-6 pb-8 rounded-lg bg-gray-50">
              <div className="-mt-6">
                <div className="text-center">
                  <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                    <BadgeCheckIcon
                      className="w-6 h-6 text-white"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-medium tracking-tight text-gray-900">
                  Verify
                </h3>
                <p className="mt-5 text-base text-gray-500">
                  People, institutions, and smart contracts can verify
                  credentials without accessing the private information used in
                  the issuance of the claim and without leaking information to
                  the issuer. Verity implements{" "}
                  <b>
                    <Link href="https://identity.foundation/presentation-exchange/">
                      <a target="_blank">Presentation Exchange</a>
                    </Link>
                  </b>{" "}
                  as its verification protocol.
                </p>
                <p className="mt-5 text-base italic text-gray-500">
                  For example, an employer can verify that a job candidate has
                  graduated from a specific university without accessing age or
                  graduation date, and without contacting the university.
                </p>
              </div>
            </div>
          </div>

          {/* Identify */}
          <div className="pt-6">
            <div className="flow-root px-6 pb-8 rounded-lg bg-gray-50">
              <div className="-mt-6">
                <div className="text-center">
                  <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                    <IdentificationIcon
                      className="w-6 h-6 text-white"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-medium tracking-tight text-gray-900">
                  Identify
                </h3>
                <p className="mt-5 text-base text-gray-500">
                  Issuers, subjects, and verifiers of credentials are identified
                  by unique Decentralized Identifiers, or{" "}
                  <b>
                    <Link href="https://www.w3.org/TR/did-core/">
                      <a target="_blank">DIDs</a>
                    </Link>
                  </b>
                  . DIDs leverage public-private key cryptography similarly to
                  blockchain addresses. Just as in the physical world where
                  individuals have several context-sensitive identities, in the
                  virtual world people may have several DIDs, each with distinct
                  credentials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Link href="/issuer">
          <a className="flex justify-center w-full px-4 py-2 pt-4 pb-4 font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm text-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <BadgeCheckIcon className="mr-2 -ml-1 w-7 h-7" aria-hidden="true" />
            Begin the Demo
          </a>
        </Link>
      </div>
    </Layout>
  )
}

export default Home
