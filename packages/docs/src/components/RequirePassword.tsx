import React, { FC, useState } from "react"
import Cookies from "universal-cookie"
import styles from "./RequirePassword.module.css"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"

/**
 * A simple component to block access to the site unless the user
 * is authenticated.  This is not intended to be considered secure
 * or production-ready.  It is merely a simple gatekeeper while
 * the demos and documentation are not public.
 */
const RequirePassword: FC = ({ children }) => {
  const cookies = new Cookies()
  const { siteConfig } = useDocusaurusContext()
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(
    !siteConfig.customFields.passwordProtected ||
      cookies.get("verite-auth") === "1"
  )

  const checkPassword = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()

    const response = await fetch(
      `${siteConfig.customFields.demosUrl}/api/auth/site`,
      {
        method: "POST",
        body: JSON.stringify({ password }),
        headers: {
          "Content-Type": "application/json"
        }
      }
    )

    cookies.set("verite-auth", "1", {
      httpOnly: false,
      domain: siteConfig.customFields.cookieDomain as string
    })

    setIsAuthenticated(response.status === 200)
  }

  return (
    <>
      {isAuthenticated ? (
        children
      ) : (
        <form className={styles.form}>
          <div>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div>
              <div className={styles.inputWrapper}>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className={styles.button}
                onClick={checkPassword}
              >
                Login
              </button>
            </div>
          </div>
        </form>
      )}
    </>
  )
}

export default RequirePassword
