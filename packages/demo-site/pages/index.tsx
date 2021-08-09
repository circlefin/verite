import { ChevronRightIcon } from "@heroicons/react/solid"
import { GetServerSideProps, NextPage } from "next"
import Link from "next/link"
import Layout from "../components/Layout"
import { currentUser } from "../lib/auth-fns"
import type { User } from "../lib/database"

type Props = {
  user?: User
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const user = await currentUser(context)

  if (user) {
    return {
      props: {
        user
      }
    }
  }

  return {
    props: {}
  }
}

const Home: NextPage<Props> = ({ user }) => {
  return (
    <Layout title="Project Verity Demo">
      <div className="container px-4 py-4 mx-auto sm:px-8">
        <ul className="divide-y divide-gray-200">
          <li>
            <Link href={`/issuer`}>
              <a className="flex justify-between py-4 hover:bg-gray-50">
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Issuer</p>
                </div>
                <ChevronRightIcon
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
              </a>
            </Link>
          </li>
          <li>
            <Link href={`/verifier`}>
              <a className="flex justify-between py-4 hover:bg-gray-50">
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Verifier</p>
                </div>
                <ChevronRightIcon
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
              </a>
            </Link>
          </li>
          {user && user.role === "admin" && (
            <li>
              <Link href={`/admin`}>
                <a className="flex justify-between py-4 hover:bg-gray-50">
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">Admin</p>
                  </div>
                  <ChevronRightIcon
                    className="w-5 h-5 text-gray-400"
                    aria-hidden="true"
                  />
                </a>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </Layout>
  )
}

export default Home
