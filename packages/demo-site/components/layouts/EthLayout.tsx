import { FC } from "react"
import { HeaderProps } from "../Header"
import BaseLayout from "./BaseLayout"

type Props = HeaderProps

const EthLayout: FC<Props> = ({ children, ...props }) => {
  return <BaseLayout {...props}>{children}</BaseLayout>
}

export default EthLayout
