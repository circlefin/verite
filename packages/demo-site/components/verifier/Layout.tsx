import { FC } from "react"
import EthLayout from "../layouts/EthAuthLayout"
import AttestationNavigation from "./AttestationNavigation"

type Props = {
  title: string
  hideNavigation?: boolean
}

const VerifierLayout: FC<Props> = ({ title, children, hideNavigation }) => {
  return (
    <EthLayout title={title} theme="blue">
      {!hideNavigation && <AttestationNavigation />}
      {children}
    </EthLayout>
  )
}

export default VerifierLayout
