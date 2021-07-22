import { createCreditScoreManifest, CredentialManifest } from "verity"
import { manifestIssuer } from "./issuer"

export const creditScoreManifest: CredentialManifest =
  createCreditScoreManifest(manifestIssuer, {
    thumbnail: {
      uri: `${process.env.HOST}/img/logo.png`,
      alt: "Verity Logo"
    },
    hero: {
      uri: `${process.env.HOST}/img/credit-score-hero.png`,
      alt: "Credit Score Visual"
    },
    background: {
      color: "#ff0000"
    },
    text: {
      color: "#d4d400"
    }
  })
