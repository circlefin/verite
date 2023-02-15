import React from "react";
import clsx from "clsx";
import styles from "./HomepageFeatures.module.css";
import architecture_map from "../../static/img/Verite_Architecture.png";

const FeatureList = [
  {
    title: "Issuers give value and freedom to their customers",
    description: (
      <><>
        Offering verifiable, portable, context-independent, off-chain "membership cards" strengthens a customer relationship and an issuer's brand.
      </><Link className="button button--secondary button--lg" to="/verite/issuers/getting-started">
          Issuer Overview
        </Link></>
    ),
  },
  {
    title: "Wallets empower their users by supporting these flows",
    description: (
      <><>
        If wallets are truly going to be the "browsers" of Web3, wallets need meaningful consent and privacy. Verite offers a minimum-viable, incremental path towards supporting these emerging patterns and development styles.
      </><Link className="button button--secondary button--lg" to="/verite/wallets/getting-started">
          Wallet Overview
        </Link></>
  ),
  },
  {
    title: "Verifiers unlock wider, safer customer bases for dapps",
    description: (
      <><>
        Faster, smoother onboarding and tapping into existing customer bases is key to getting more and better users; standards and herd privacy are key to doing so without deanonymizing them or discriminating one wallet at a time.
      </><Link className="button button--secondary button--lg" to="/verite/issuers/getting-started">
          Issuer Overview
        </Link></>
    
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
          <img src={architecture_map} />
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
