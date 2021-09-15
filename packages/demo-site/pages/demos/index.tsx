import Link from "next/link"
import { FC } from "react"
import Layout from "../../components/Layout"

const DemosIndex: FC = () => {
  return (
    <Layout title="Demos">
      <ul>
        <li>
          <Link href="/demos/issuer">
            <a>Issuer</a>
          </Link>
        </li>
        <li>
          <Link href="/demos/cefi">
            <a>Cefi</a>
          </Link>
        </li>
      </ul>
    </Layout>
  )
}

export default DemosIndex
