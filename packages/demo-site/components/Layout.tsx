import { FC } from "react"
import Header, { HeaderProps } from "./Header"

type Props = HeaderProps

const Layout: FC<Props> = ({ children, ...headerProps }) => {
  return (
    <div className="text-base antialiased text-black bg-white font-inter font-feature-default">
      <Header {...headerProps} />
      <main className="-mt-32">
        <div className="max-w-4xl px-4 pb-12 mx-auto sm:px-6 lg:px-8">
          <div className="px-5 py-6 overflow-hidden bg-white rounded-lg shadow sm:px-6">
            {children}
          </div>
          <div className="pt-8 prose-sm text-center">
            <p className="text-gray-500 font-extralight">
              &copy;2021 Centre | Software open sourced under the MIT license
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Layout
