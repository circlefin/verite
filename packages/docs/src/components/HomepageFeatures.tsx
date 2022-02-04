import React from "react";
import clsx from "clsx";
import styles from "./HomepageFeatures.module.css";

const FeatureList = [
  {
    title: "Identity building blocks for DeFi",
    Svg: require("../../static/img/undraw_building_blocks_n0nc.svg").default,
    description: (
      <>
        Data models, protocol recipes, and open source software that links
        identity proofs to crypto finance experiences.
      </>
    ),
  },
  {
    title: "Secure, privacy-preserving credentials",
    Svg: require("../../static/img/undraw_Safe_re_kiil.svg").default,
    description: (
      <>
        Decentralized identity-based data models and protocols that are
        privacy-preserving by default.
      </>
    ),
  },
  {
    title: "Lightweight, secure exchange and verification protocols",
    Svg: require("../../static/img/undraw_online_transactions_02ka.svg")
      .default,
    description: (
      <>
        People, institutions, and smart contracts can verify credentials without
        accessing the private information used in the issuance of the claim and
        without leaking information.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
