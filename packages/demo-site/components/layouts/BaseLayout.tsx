import { FC } from "react"
import Header, { HeaderProps } from "../Header"

type Props = HeaderProps & {
  authSection?: JSX.Element
  noPadding?: boolean
}

const BaseLayout: FC<Props> = ({
  children,
  authSection,
  noPadding,
  ...headerProps
}) => {
  const bodyPadding = noPadding ? "" : "px-5 py-6 sm:px-6"

  return (
    <div className="text-base antialiased text-black bg-white font-inter font-feature-default">
      <Header {...headerProps}>{authSection}</Header>
      <main className="-mt-32">
        <div className="max-w-4xl px-4 pb-12 mx-auto sm:px-6 lg:px-8">
          <div
            className={`bg-white rounded-lg shadow ${bodyPadding} overflow-hidden`}
          >
            {children}
          </div>
          <div className="prose-sm pt-8 text-center">
            <p className="font-extralight text-gray-500">
              &copy;2021 Centre | Software open sourced under the MIT license
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BaseLayout
