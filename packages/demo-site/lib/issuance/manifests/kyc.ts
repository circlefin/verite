import { createKycAmlManifest, CredentialManifest } from "@centre/verity"
import { manifestIssuer } from "./issuer"

export const kycManifest: CredentialManifest = createKycAmlManifest(
  manifestIssuer,
  {
    thumbnail: {
      uri: `${process.env.HOST}/img/logo.png`,
      alt: "Verity Logo"
    },
    hero: {
      uri: `${process.env.HOST}/img/kyc-aml-hero.png`,
      alt: "KYC+AML Visual"
    },
    background: {
      color: "#EC4899"
    },
    text: {
      color: "#FFFFFF"
    }
  }
)
