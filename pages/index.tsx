import { NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Verity Demo</title>
      </Head>

      <main className="container py-4 mx-auto font-inter">
        <h1 className="text-4xl font-extrabold tracking-tight text-center">
          Project Verity Demo
        </h1>
      </main>
    </>
  );
};

export default Home;
