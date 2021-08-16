import { createCreditScoreManifest } from "@centre/verity"
import type { CredentialManifest } from "@centre/verity"
import { publicUrl } from "../api-fns"
import { manifestIssuer } from "./issuer"

export const creditScoreManifest: CredentialManifest =
  createCreditScoreManifest(manifestIssuer, {
    thumbnail: {
      uri: publicUrl(`/img/credit-score-thumbnail.png`),
      alt: "Verity Logo"
    },
    hero: {
      uri: publicUrl(`/img/credit-score-hero.png`),
      alt: "Credit Score Visual"
    },
    background: {
      color: "#8B5CF6"
    },
    text: {
      color: "#FFFFFF"
    }
  })
