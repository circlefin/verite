import { FC } from "react"
import BaseLayout from "../layouts/BaseLayout"
import AttestationNavigation from "./AttestationNavigation"

type Props = {
  title: string
  hideNavigation?: boolean
}

const VerifierLayout: FC<Props> = ({ title, children, hideNavigation }) => {
  return (
    <BaseLayout title={title}>
      {!hideNavigation && <AttestationNavigation />}
      {children}
    </BaseLayout>
  )
}

export default VerifierLayout
