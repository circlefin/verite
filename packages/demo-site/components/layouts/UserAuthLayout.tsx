import { FC } from "react"
import { HeaderProps } from "../Header"
import BaseLayout from "./BaseLayout"

const UserAuthLayout: FC<HeaderProps> = ({ children, ...headerProps }) => {
  return <BaseLayout {...headerProps}>{children}</BaseLayout>
}

export default UserAuthLayout
