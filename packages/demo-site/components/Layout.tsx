import Link from "next/link"
import { FC } from "react"
import Header, { HeaderProps } from "./Header"
import DemoSelector from "./layout/DemoSelector"

type Props = HeaderProps

const Layout: FC<Props> = ({ children, ...headerProps }) => {
  return (
    <div className="text-base antialiased text-black bg-white font-inter font-feature-default">
      <div className="text-white bg-gray-900">
        <div className="flex flex-col items-center justify-between max-w-4xl px-4 mx-auto sm:space-x-8 sm:h-16 sm:flex-row sm:px-6 lg:px-8">
          <Link href="/">
            <a className="text-2xl font-extrabold tracking-tight text-center text-white hover:text-gray-400">
              Verity.id
            </a>
          </Link>

          <div className="w-full sm:px-8">
            <DemoSelector />
          </div>

          <Link href="/documentation">
            <a className="px-3 py-2 text-sm font-medium text-white rounded-md hover:text-gray-400">
              Documentation
            </a>
          </Link>
        </div>
      </div>

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
