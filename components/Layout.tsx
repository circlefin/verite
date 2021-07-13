import { FC } from "react"
import Header from "./Header"

const Layout: FC = ({ children }) => {
  return (
    <div className="text-base antialiased text-black bg-white font-inter font-feature-default">
      <Header />
      <main className="py-4">{children}</main>
    </div>
  )
}

export default Layout
