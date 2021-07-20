import { Session } from "next-auth"
import { FC } from "react"
import AttestationNavigation from "./AttestationNavigation"
import Layout from "components/Layout"

type Props = {
  title: string
  session?: Session
}

const IssuerLayout: FC<Props> = ({ title, children, session }) => {
  return (
    <Layout title={title} theme="gray">
      {session && <AttestationNavigation />}
      {children}
    </Layout>
  )
}

export default IssuerLayout
