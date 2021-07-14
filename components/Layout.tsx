import Head from "next/head"
import { FC } from "react"
import Header from "./Header"

type Props = {
  title: string
}

const Layout: FC<Props> = ({ children, title }) => {
  return (
    <>
      <Head>
        <title>{title} | Verity Demo</title>
      </Head>
      <div className="text-base antialiased text-black bg-white font-inter font-feature-default">
        <Header title={title} />
        <main className="-mt-32">
          <div className="px-4 pb-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-5 py-6 bg-white rounded-lg shadow sm:px-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default Layout
