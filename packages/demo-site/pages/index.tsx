import { BadgeCheckIcon } from "@heroicons/react/solid"
import { NextPage } from "next"
import Image from "next/image"
import Link from "next/link"
import Layout from "../components/layouts/UserAuthLayout"

const Home: NextPage = () => {
  return (
    <Layout title="Decentralized Identity for Crypto Finance.">
      <article className="prose-2xl pb-6">
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
        <div className="bg-white rounded-lg overflow-hidden p-4 border-gray-300 border">
          <p className="prose-2xl">Issue</p>
          <p className="prose-sm pb-2 max-w-none">
            Identities are defined by traits called <i>claims</i>. One identity
            can attest to the authenticity and correctness of another
            identity&apos;s claims by issuing a cryptographic{" "}
            <b>
              <Link href="https://www.w3.org/TR/vc-data-model/">
                Verifiable Credential
              </Link>
            </b>{" "}
            about the claim.
          </p>
          <p className="prose-sm pb-4 italic max-w-none">
            For example, a university might issue a Verifiable Credential that
            cryptographically proves an individual&apos;s graduation claim.
          </p>
        </div>

        <div className="bg-white rounded-lg overflow-hidden p-4 border-gray-300 border">
          <p className="prose-2xl">Custody</p>
          <p className="prose-sm pb-6 max-w-none">
            People and institutions &mdash; the <i>subjects</i> of the
            credentials &mdash; custody their Verifiable Credentials in wallets
            just as they hold their own USDC and other crypto assets. Subjects
            may &quot;self-custody&quot; or rely on a trusted host to custody
            their credentials.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pb-6">
        <div className="bg-white rounded-lg overflow-hidden p-4 border-gray-300 border">
          <p className="prose-2xl">Verify</p>
          <p className="prose-sm pb-2 max-w-none">
            People, institutions, and smart contracts can verify credentials
            without accessing the private information used in the issuance of
            the claim and without leaking information to the issuer.
          </p>
          <p className="prose-sm italic pb-4 max-w-none">
            For example, an employer can verify that a job candidate has
            graduated from a specific university without accessing age or
            graduation date, and without contacting the university.
          </p>
        </div>

        <div className="bg-white rounded-lg overflow-hidden p-4 border-gray-300 border">
          <p className="prose-2xl">Identify</p>
          <p className="prose-sm pb-4 max-w-none">
            Issuers, subjects, and verifiers of credentials are identified by
            unique Decentralized Identifiers, or{" "}
            <b>
              <Link href="https://www.w3.org/TR/did-core/">DIDs</Link>
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
        <button
          className="flex justify-center px-4 py-2 text-md 
          w-full pt-4 pb-4 font-medium text-white bg-blue-600 border border-transparent 
          rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 
          focus:ring-offset-2 focus:ring-blue-500"
        >
          <BadgeCheckIcon className="w-7 h-7 mr-2 -ml-1" aria-hidden="true" />
          <Link href="/issuer">Begin the Demo</Link>
        </button>
      </div>
    </Layout>
  )
}

export default Home
