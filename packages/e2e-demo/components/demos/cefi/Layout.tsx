import { useSession } from "next-auth/react"
import { FC } from "react"

import Layout from "../../shared/Layout"
import Navigation from "./Navigation"

type Props = {
  hideNavigation?: boolean
}

const IssuerLayout: FC<Props> = ({ children, hideNavigation }) => {
  const { data: session } = useSession()

  const trapezoid = ["alice@test.com", "sean@test.com", "matt@test.com"]
  let bgColor
  if (session) {
    bgColor = trapezoid.includes(session?.user?.email)
      ? "bg-red-100"
      : "bg-blue-100"
  }

  return (
    <Layout title="Demo: Centralized App with Travel Rule" bgColor={bgColor}>
      {!hideNavigation && <Navigation />}
      <div>{children}</div>
    </Layout>
  )
}

export default IssuerLayout
