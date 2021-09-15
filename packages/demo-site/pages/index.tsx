import { BadgeCheckIcon } from "@heroicons/react/solid"
import { NextPage } from "next"
import Image from "next/image"
import Link from "next/link"
import Layout from "../components/Layout"

const Home: NextPage = () => {
  return (
    <Layout title="Decentralized Identity for Crypto Finance.">
      <article className="pb-6 prose-2xl">
        Verity defines data models, protocol recipes, and open source software
        that links identity proofs to crypto finance experiences.
      </article>
      <Image
        src="/img/sequence-overview.png"
        width="1180"
        height="380"
        alt="Overview Sequence"
      />

      <div className="grid grid-cols-2 gap-4 pb-6">
        <div className="p-4 overflow-hidden bg-white border border-gray-300 rounded-lg">
          <p className="prose-2xl">Issue</p>
          <p className="pb-2 prose-sm max-w-none">
            Identities are defined by traits called <i>claims</i>. One identity
            can attest to the authenticity and correctness of another
            identity&apos;s claims by issuing a cryptographic{" "}
            <b>
              <Link href="https://www.w3.org/TR/vc-data-model/">
                <a target="_blank">Verifiable Credential</a>
              </Link>
            </b>{" "}
            about the claim.
          </p>
          <p className="pb-4 italic prose-sm max-w-none">
            For example, a university might issue a Verifiable Credential that
            cryptographically proves an individual&apos;s graduation claim.
          </p>
        </div>

        <div className="p-4 overflow-hidden bg-white border border-gray-300 rounded-lg">
          <p className="prose-2xl">Custody</p>
          <p className="pb-6 prose-sm max-w-none">
            People and institutions &mdash; the <i>subjects</i> of the
            credentials &mdash; custody their Verifiable Credentials in wallets
            just as they hold their own USDC and other crypto assets. Subjects
            may &quot;self-custody&quot; or rely on a trusted host to custody
            their credentials. The custodian is also called the <i>holder</i>.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pb-6">
        <div className="p-4 overflow-hidden bg-white border border-gray-300 rounded-lg">
          <p className="prose-2xl">Verify</p>
          <p className="pb-2 prose-sm max-w-none">
            People, institutions, and smart contracts can verify credentials
            without accessing the private information used in the issuance of
            the claim and without leaking information to the issuer. Verity
            implements{" "}
            <b>
              <Link href="https://identity.foundation/presentation-exchange/">
                <a target="_blank">Presentation Exchange</a>
              </Link>
            </b>{" "}
            as its verification protocol.
          </p>
          <p className="pb-4 italic prose-sm max-w-none">
            For example, an employer can verify that a job candidate has
            graduated from a specific university without accessing age or
            graduation date, and without contacting the university.
          </p>
        </div>

        <div className="p-4 overflow-hidden bg-white border border-gray-300 rounded-lg">
          <p className="prose-2xl">Identify</p>
          <p className="pb-4 prose-sm max-w-none">
            Issuers, subjects, and verifiers of credentials are identified by
            unique Decentralized Identifiers, or{" "}
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
