import { signIn, signOut, useSession } from "next-auth/client"
import { FC } from "react"

const Header: FC = () => {
  const [session, loading] = useSession()

  if (loading) {
    return <></>
  }

  return (
    <>
      {!session && (
        <>
          Not signed in <br />
          <button onClick={() => signIn()}>Sign in</button>
        </>
      )}
      {session && (
        <>
          Signed in as {session.user.email} <br />
          <button onClick={() => signOut({ callbackUrl: "/" })}>
            Sign out
          </button>
        </>
      )}
    </>
  )
}

export default Header
