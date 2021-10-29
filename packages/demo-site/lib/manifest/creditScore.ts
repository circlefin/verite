import { buildCreditScoreManifest } from "@verity/verity"
import type { CredentialManifest } from "@verity/verity"
import { fullURL } from "../utils"
import { manifestIssuer } from "./issuer"

export const creditScoreManifest: CredentialManifest = buildCreditScoreManifest(
  manifestIssuer,
  {
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
  }
)
