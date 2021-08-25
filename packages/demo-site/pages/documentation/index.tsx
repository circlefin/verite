import { NextPage } from "next"
import Link from "next/link"
import Layout from "../../components/Layout"
import { requireAuth } from "../../lib/auth-fns"

export const getServerSideProps = requireAuth(async () => {
  return {
    props: {}
  }
})

type Reference = {
  title: string
  link: string
}

const DocumentationPage: NextPage = () => {
  return (
    <Layout title="References">
      <div className="prose max-w-none">
        <h2>Verity Docs</h2>
        {docRefs.map((ref) => (
          <div key={ref.title} className="pb-6">
            <b>{ref.title}:</b>
            <br />
            <Link href={ref.link}>
              <a target="_blank">{ref.link}</a>
            </Link>
          </div>
        ))}

        <h2>Verity Source</h2>
        {srcRefs.map((ref) => (
          <div key={ref.title} className="pb-6 max-w-none">
            <b>{ref.title}:</b>
            <br />
            <Link href={ref.link}>
              <a target="_blank">{ref.link}</a>
            </Link>
          </div>
        ))}

        <h2>Identity Standards</h2>
        {extRefs.map((ref) => (
          <div key={ref.title} className="pb-6 max-w-none">
            <b>{ref.title}:</b>
            <br />
            <Link href={ref.link}>
              <a target="_blank">{ref.link}</a>
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  )
}

const docRefs: Array<Reference> = [
  {
    title: "Public documentation",
    link: "https://github.com/centrehq/verity-docs"
  },
  {
    title: "Private Centre drive",
    link: "https://drive.google.com/drive/folders/1jU0W9VLjS8ssGRsjk6lvqc46ugcm8RT7?usp=sharing"
  }
]

const srcRefs: Array<Reference> = [
  {
    title: "Core library",
    link: "https://github.com/centrehq/demo-site/tree/main/packages/verity"
  },
  {
    title: "Demo site (this web app)",
    link: "https://github.com/centrehq/demo-site"
  },
  {
    title: "Demo wallet (iOS app)",
    link: "https://github.com/centrehq/demo-wallet"
  },
  {
    title: "Demo solidity contracts",
    link: "https://github.com/centrehq/demo-site/tree/main/packages/contract"
  }
]

const extRefs: Array<Reference> = [
  {
    title: "Decentralized Identifiers (DIDs)",
    link: "https://www.w3.org/TR/did-core/"
  },
  {
    title: "Verifiable Credentials and Verifiable Presentations",
    link: "https://www.w3.org/TR/vc-data-model/"
  },
  {
    title: "Presentation Exchange",
    link: "https://identity.foundation/presentation-exchange/"
  }
]

export default DocumentationPage
