import Head from "next/head";
import { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Verity Demo</title>
      </Head>

      <main className="font-inter container mx-auto py-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-center">
          Project Verity Demo
        </h1>
      </main>
    </>
  );
};

export default Home;
