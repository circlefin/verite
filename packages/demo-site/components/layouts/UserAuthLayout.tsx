import Head from "next/head"
import { FC } from "react"
import Header from "../Header"

type Props = {
  title: string
  theme?: string
}

const Layout: FC<Props> = ({ children, title, theme }) => {
  return (
    <>
      <Head>
        <title>{title} | Verity Demo</title>
      </Head>
      <div className="text-base antialiased text-black bg-white font-inter font-feature-default">
        <Header title={title} theme={theme} skipAuth={false} />
        <main className="-mt-32">
          <div className="max-w-3xl px-4 pb-12 mx-auto sm:px-6 lg:px-8">
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
