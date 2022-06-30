import {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextApiRequest
} from "next"
import { getSession } from "next-auth/react"

import { findUser, User } from "./database"

/**
 * Require authentication for a next.js page GetServerSideProps method
 *
 * @remark This method is a wrapper around your existing getServerSideProps method
 *
 * @example
 * export const getServerSideProps = requireAuth(async (context) => { ... })
 */
export function requireAuth<T>(
  getServerSideProps: GetServerSideProps<T>,
  signInPath = "/auth/signin"
): GetServerSideProps<T> {
  return async (context) => {
    const session = await getSession(context)

    if (!session || !session.user) {
      return {
        redirect: {
          destination: `${signInPath}?redirectTo=${context.resolvedUrl}`,
          permanent: false
        }
      }
    }

    return getServerSideProps(context)
  }
}

/**
 * Load the current user for a next.js page GetServerSideProps method
 *
 * @example
 * const user = await currentUser(context)
 */
export async function currentUser(
  context: GetServerSidePropsContext | { req: NextApiRequest }
): Promise<User | null> {
  const session = await getSession(context)

  if (session && session.user) {
    return findUser((session.user as User).id)
  }
}
