import { FC } from "react"
import EthLayout from "../layouts/EthAuthLayout"
import AttestationNavigation from "./AttestationNavigation"

type Props = {
  title: string
  hideNavigation?: boolean
}

const VerifierLayout: FC<Props> = ({ title, children, hideNavigation }) => {
  return (
    <EthLayout title={title}>
      <div className="px-5 py-6 sm:px-6">
        {!hideNavigation && <AttestationNavigation />}
        {children}
      </div>
    </EthLayout>
  )
}

export default VerifierLayout
