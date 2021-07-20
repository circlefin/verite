import { GetServerSideProps, GetServerSidePropsContext } from "next"
import { getSession } from "next-auth/client"
import { findUser, User } from "./database"

export function requireAuth<T>(
  getServerSideProps: GetServerSideProps<T>
): GetServerSideProps<T> {
  return async (context) => {
    const session = await getSession(context)

    if (!session || !session.user) {
      return {
        redirect: {
          destination: `/signin?redirectTo=${context.resolvedUrl}`,
          permanent: false
        }
      }
    }

    return getServerSideProps(context)
  }
}

export function requireAdmin<T>(
  getServerSideProps: GetServerSideProps<T>
): GetServerSideProps<T> {
  return requireAuth<T>(async (context) => {
    const user = await currentUser(context)

    if (user.role !== "admin") {
      return {
        redirect: {
          destination: `/`,
          permanent: false
        }
      }
    }

    return getServerSideProps(context)
  })
}

export async function currentUser(
  context: GetServerSidePropsContext
): Promise<User | null> {
  const session = await getSession(context)

  if (session && session.user) {
    return findUser((session.user as User).id)
  }
}
