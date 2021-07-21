import { manifestIssuer } from "./issuer"
import { createKycAmlManifest, CredentialManifest } from "lib/verity"

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
      color: "#ff0000"
    },
    text: {
      color: "#d4d400"
    }
  }
)
