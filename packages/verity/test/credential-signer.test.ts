import { CredentialSigner, decodeVerifiableCredential } from "../lib/utils"
import type { JwtCredentialPayload } from "../types"

describe("VC signing", () => {
  it("signs a VC", async () => {
    const credentialSigner = new CredentialSigner(
      "did:key:z6MksGKh23mHZz2FpeND6WxJttd8TWhkTga7mtbM1x1zM65m",
      "1f0465e2546027554c41584ca53971dfc3bf44f9b287cb15b5732ad84adb4e63be5aa9b3df96e696f4eaa500ec0b58bf5dfde59200571b44288cc9981279a238"
    )

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
    expect(decoded.type.length).toEqual(1)
    expect(decoded.type[0]).toEqual("VerifiableCredential")
    expect(decoded.credentialSubject.degree.type).toEqual("BachelorDegree")
    expect(decoded.credentialSubject.degree.name).toEqual(
      "Baccalauréat en musiques numériques"
    )
  })
})
