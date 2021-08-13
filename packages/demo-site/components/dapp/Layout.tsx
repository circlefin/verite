import Head from "next/head";
import { FC } from "react";

type Props = {
  title: string;
};

const Layout: FC<Props> = ({ children, title }) => {
  return (
    <>
      <Head>
        <title>{title} | Smart Contract Recipe</title>
        <meta
          name="description"
          content="Verity Smart Contract and dApp Boilerplate"
        />
      </Head>
      <div className="text-base antialiased text-black bg-white font-inter font-feature-default">
        <main className="-mt-32">
          <div className="max-w-3xl px-4 pb-12 mx-auto sm:px-6 lg:px-8">
            <div className="px-5 py-6 bg-white rounded-lg shadow sm:px-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Layout;
