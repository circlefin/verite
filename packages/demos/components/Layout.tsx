import { compact } from "lodash"
import Head from "next/head"
import Link from "next/link"
import { FC } from "react"
import { classNames } from "../lib/react-fns"

type Props = {
  title?: string
  bgColor?: string
}

/**
 * This Functional Component is a wrapper for every page in the app, providing
 * the shared header, navigation, and footer.
 *
 * @param props.title The title of the page.
 * @param props.bgColor The background color of the page. Used to distinguish between the two CeFi demos
 */
const Layout: FC<Props> = ({ children, title, bgColor }) => {
  return (
    <>
      <Head>
        <title>{compact(["Verity.id", title]).join(" | ")}</title>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/path/to/apple-touch-icon.png" />
      </Head>
      <div
        className={classNames(
          bgColor || "bg-gray-100",
          "min-h-screen px-4 text-base antialiased text-black font-inter font-feature-default"
        )}
      >
        <div className="max-w-3xl mx-auto">
          <header className="flex flex-col items-center justify-between p-4 pt-8 space-y-4 sm:p-8 sm:flex-row sm:space-y-0">
            <Link href="/">
              <a className="text-2xl font-extrabold tracking-tight text-center text-gray-900 hover:text-blue-500">
                Verity.id
              </a>
            </Link>

            <div className="flex items-center justify-between space-x-4">
              <Link href="/demos">
                <a className="px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-blue-500 hover:text-white">
                  Demos
                </a>
              </Link>
              <Link href="/documentation">
                <a className="px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-blue-500 hover:text-white">
                  Documentation
                </a>
              </Link>
            </div>
          </header>
          <main className="max-w-4xl p-4 mx-auto bg-white sm:p-8 rounded-xl">
            {title && (
              <h1 className="pb-4 mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                {title}
              </h1>
            )}
            {children}
          </main>
          <footer className="py-8 text-sm text-center text-gray-500 text-extralight">
            &copy;{new Date().getFullYear()} Centre | Software open sourced
            under the MIT license
          </footer>
        </div>
      </div>
    </>
  )
}

export default Layout
