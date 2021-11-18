import React, { FC, useEffect, useState } from "react"
import Cookies from "universal-cookie"
import styles from "./RequirePassword.module.css"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"

const cookies = new Cookies()

/**
 * This layout should be used on all pages and provides a minimal
 * password protection system.
 */
const RequirePassword: FC = ({ children }) => {
  const { siteConfig } = useDocusaurusContext()
  const protectedPassword = siteConfig.customFields?.protectedPassword
  const passwordCookie: string =
    (siteConfig.customFields?.passwordCookie as string) || "password"
  const [passwordSuccessful, setPasswordSuccessful] = useState(false)
  const [password, setPassword] = useState(cookies.get(passwordCookie))

  const checkPassword = () => {
    if (password === protectedPassword) {
      cookies.set(passwordCookie, password)
      setPasswordSuccessful(true)
    } else {
      setPasswordSuccessful(false)
    }

    setPassword("")
  }

  useEffect(() => {
    if (!protectedPassword) {
      setPasswordSuccessful(true)
    } else {
      checkPassword()
    }
  }, [])

  return (
    <>
      {passwordSuccessful ? (
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
                onClick={(e) => {
                  e.preventDefault()
                  checkPassword()
                }}
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
