import { CredentialIssuer } from "lib/verity"

export const manifestIssuer: CredentialIssuer = {
  id: "did:web:verity.id",
  comment: "JSON-LD definition at https://verity.id/.well_known/did.json",
  name: "Verity",
  styles: {}
}
