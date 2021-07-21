import { JwtCredentialPayload } from "did-jwt-vc"
import { credentialSigner } from "lib/signer"
import { decodeVerifiableCredential } from "lib/verity"

describe("VC signing", () => {
  it("signs a VC", async () => {
    const vcPayload: JwtCredentialPayload = {
      sub: "did:ethr:0x435df3eda57154cf8cf7926079881f2912f54db4",
      nbf: 1562950282,
      vc: {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiableCredential"],
        credentialSubject: {
          degree: {
            type: "BachelorDegree",
            name: "Baccalauréat en musiques numériques"
          }
        }
      }
    }
    const result = await credentialSigner.signVerifiableCredential(vcPayload)
    const decoded = await decodeVerifiableCredential(result)
    expect(decoded.verifiableCredential.type.length).toEqual(1)
    expect(decoded.verifiableCredential.type[0]).toEqual("VerifiableCredential")
    expect(decoded.verifiableCredential.credentialSubject.degree.type).toEqual(
      "BachelorDegree"
    )
    expect(decoded.verifiableCredential.credentialSubject.degree.name).toEqual(
      "Baccalauréat en musiques numériques"
    )
  })
})
