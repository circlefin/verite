import { createCreditScoreManifest } from "@centre/verity"
import type { CredentialManifest } from "@centre/verity"
import { manifestIssuer } from "./issuer"

export const creditScoreManifest: CredentialManifest =
  createCreditScoreManifest(manifestIssuer, {
    thumbnail: {
      uri: `${process.env.NEXT_PUBLIC_NGROK_HOST}/img/credit-score-thumbnail.png`,
      alt: "Verity Logo"
    },
    hero: {
      uri: `${process.env.NEXT_PUBLIC_NGROK_HOST}/img/credit-score-hero.png`,
      alt: "Credit Score Visual"
    },
    background: {
      color: "#8B5CF6"
    },
    text: {
      color: "#FFFFFF"
    }
  })
