import { Session } from "next-auth"
import { useSession, signIn } from "next-auth/client"
import { FC } from "react"

export type SessionProps = {
  session: Session
}

const Authenticated: FC = ({ children }) => {
  const [session, loading] = useSession()

  if (loading) {
    return <></>
  }

  if (!session) {
    return (
      <>
        <h1>Access Denied</h1>
        <button onClick={() => signIn()}>
          You must be signed in to view this page
        </button>
      </>
    )
  }

  return <>{children}</>
}

export default Authenticated
