import { manifestIssuer } from "./issuer"
import { createCreditScoreManifest, CredentialManifest } from "lib/verity"

export const creditScoreManifest: CredentialManifest =
  createCreditScoreManifest(manifestIssuer, {
    thumbnail: {
      uri: "https://verity.id/img/logo.png",
      alt: "Verity Logo"
    },
    hero: {
      uri: "https://verity.id/img/kycCred.png",
      alt: "KYC Visual"
    },
    background: {
      color: "#ff0000"
    },
    text: {
      color: "#d4d400"
    }
  })
