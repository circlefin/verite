import { Web3Provider } from "@ethersproject/providers"
import { Web3ReactProvider } from "@web3-react/core"
import { Provider } from "next-auth/client"
import { AppProps } from "next/app"
import App from "next/app"
import "tailwindcss/tailwind.css"
import NextNprogress from "nextjs-progressbar"
import Cookies from "universal-cookie"
import RequirePassword from "../components/RequirePassword"
import { PASSWORD_PROTECTION_COOKIE } from "../lib/react-fns"

/**
 * Build an `ethers.js` Web3Provider for the given wallet
 */
function getLibrary(provider): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

function DemoApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <Provider session={pageProps.session}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <RequirePassword {...pageProps}>
          <NextNprogress color="#3B82F6" options={{ showSpinner: false }} />
          <Component {...pageProps} />
        </RequirePassword>
      </Web3ReactProvider>
    </Provider>
  )
}

/**
 * Password protect the entire website.
 *
 * TODO: This should be removed post-announcement
 */
DemoApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext)

  if (appContext.ctx.req) {
    /**
     * Add basic authentication to the site
     */
    const cookies = new Cookies(appContext.ctx.req.headers.cookie)
    const password = cookies.get(PASSWORD_PROTECTION_COOKIE) ?? ""

    if (
      !process.env.PROTECTED_PASSWORD ||
      password === process.env.PROTECTED_PASSWORD
    ) {
      appProps.pageProps.passwordSuccessful = true
    }
  } else {
    // client-side rendering, meaning we've already authenticated. continue.
    appProps.pageProps.passwordSuccessful = true
  }

  return { ...appProps }
}

export default DemoApp
