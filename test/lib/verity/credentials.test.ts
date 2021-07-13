import { JwtCredentialPayload } from "did-jwt-vc"
import { decodeVc, signVc } from "lib/verity"

// tslint:disable-next-line: max-line-length
const signedVc =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImRlZ3JlZSI6eyJ0eXBlIjoiQmFjaGVsb3JEZWdyZWUiLCJuYW1lIjoiQmFjY2FsYXVyw6lhdCBlbiBtdXNpcXVlcyBudW3DqXJpcXVlcyJ9fX0sInN1YiI6ImRpZDpldGhyOjB4NDM1ZGYzZWRhNTcxNTRjZjhjZjc5MjYwNzk4ODFmMjkxMmY1NGRiNCIsIm5iZiI6MTU2Mjk1MDI4MiwiaXNzIjoiZGlkOmtleTp6Nk1rc0dLaDIzbUhaejJGcGVORDZXeEp0dGQ4VFdoa1RnYTdtdGJNMXgxek02NW0ifQ.d1JNjJGQmQjAyI2oqgqeR2Naze6c2Cp20FHDiKbDg1FAMZsVNXiNKfySjzcm01rnpKFusj9N6wvWJh5HA7EZDg"

describe("VC signing and decoding", () => {
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
    const result = await signVc(vcPayload)
    const decoded = await decodeVc(result)
    expect(decoded.verifiableCredential.type.length).toEqual(1)
    expect(decoded.verifiableCredential.type[0]).toEqual("VerifiableCredential")
    expect(decoded.verifiableCredential.credentialSubject.degree.type).toEqual(
      "BachelorDegree"
    )
    expect(decoded.verifiableCredential.credentialSubject.degree.name).toEqual(
      "Baccalauréat en musiques numériques"
    )
  })

  it("decodes a VC", async () => {
    const decoded = await decodeVc(signedVc)
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
