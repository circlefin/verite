import { createCreditScoreManifest } from "@centre/verity"
import type { CredentialManifest } from "@centre/verity"
import { fullURL } from "../utils"
import { manifestIssuer } from "./issuer"

export const creditScoreManifest: CredentialManifest =
  createCreditScoreManifest(manifestIssuer, {
    thumbnail: {
      uri: fullURL("/img/credit-score-thumbnail.png"),
      alt: "Verity Logo"
    },
    hero: {
      uri: fullURL("/img/credit-score-hero.png"),
      alt: "Credit Score Visual"
    },
    background: {
      color: "#8B5CF6"
    },
    text: {
      color: "#FFFFFF"
    }
  })
