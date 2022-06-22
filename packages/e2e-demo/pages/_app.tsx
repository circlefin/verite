import "../styles/fonts.css"
import "tailwindcss/tailwind.css"

import { Web3Provider } from "@ethersproject/providers"
import { Web3ReactProvider } from "@web3-react/core"
import { SessionProvider } from "next-auth/react"
import App from "next/app"
import NextNprogress from "nextjs-progressbar"
import Cookies from "universal-cookie"

import RequirePassword from "../components/auth/RequirePassword"

import type { AppProps } from "next/app"

/**
 * Build an `ethers.js` Web3Provider for the given wallet
 */
function getLibrary(provider): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

function DemoApp({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps): JSX.Element {
  return (
    <SessionProvider session={pageProps.session}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <RequirePassword {...pageProps}>
          <NextNprogress color="#3B82F6" options={{ showSpinner: false }} />
          <Component {...pageProps} />
        </RequirePassword>
      </Web3ReactProvider>
    </SessionProvider>
  )
}

/**
 * This intercepts the Server-Side-Rendered (SSR) requests to check
 * if the end-user is authenticated & able to see the demos. This ensures
 * the app is properly hydrated upon page load.
 */
DemoApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext)

  if (process.env.PASSWORD_PROTECTED !== "true") {
    // Password protection is disabled, allow access to all pages
    appProps.pageProps.passwordSuccessful = true
  } else if (appContext.ctx.req) {
    // Rendering on the server, checkif the user is authenticated
    const cookies = new Cookies(appContext.ctx.req.headers.cookie)

    if (cookies.get("verite-auth") === "1") {
      appProps.pageProps.passwordSuccessful = true
    }
  }

  return { ...appProps }
}

export default DemoApp
