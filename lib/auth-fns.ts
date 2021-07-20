import { GetServerSideProps, GetServerSidePropsResult } from "next"
import { getSession } from "next-auth/client"

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
