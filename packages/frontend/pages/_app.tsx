import { AppProps } from "next/app"

import "bootstrap/dist/css/bootstrap.css"

function DemoDapp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <Component {...pageProps} />
  )
}

export default DemoDapp
