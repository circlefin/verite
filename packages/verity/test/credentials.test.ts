import { ValidationError } from "../lib/errors"
import {
  decodeVerifiableCredential,
  decodeVerifiablePresentation
} from "../lib/utils"

const signedVc =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImRlZ3JlZSI6eyJ0eXBlIjoiQmFjaGVsb3JEZWdyZWUiLCJuYW1lIjoiQmFjY2FsYXVyw6lhdCBlbiBtdXNpcXVlcyBudW3DqXJpcXVlcyJ9fX0sInN1YiI6ImRpZDpldGhyOjB4NDM1ZGYzZWRhNTcxNTRjZjhjZjc5MjYwNzk4ODFmMjkxMmY1NGRiNCIsIm5iZiI6MTU2Mjk1MDI4MiwiaXNzIjoiZGlkOmtleTp6Nk1rc0dLaDIzbUhaejJGcGVORDZXeEp0dGQ4VFdoa1RnYTdtdGJNMXgxek02NW0ifQ.d1JNjJGQmQjAyI2oqgqeR2Naze6c2Cp20FHDiKbDg1FAMZsVNXiNKfySjzcm01rnpKFusj9N6wvWJh5HA7EZDg"
const expiredVc =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjYyMDgzNTIsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiZGVncmVlIjp7InR5cGUiOiJCYWNoZWxvckRlZ3JlZSIsIm5hbWUiOiJCYWNjYWxhdXLDqWF0IGVuIG11c2lxdWVzIG51bcOpcmlxdWVzIn19fSwic3ViIjoiZGlkOmV0aHI6MHg0MzVkZjNlZGE1NzE1NGNmOGNmNzkyNjA3OTg4MWYyOTEyZjU0ZGI0IiwibmJmIjoxNjI2MjA4MzQyLCJpc3MiOiJkaWQ6a2V5Ono2TWtzR0toMjNtSFp6MkZwZU5ENld4SnR0ZDhUV2hrVGdhN210Yk0xeDF6TTY1bSJ9.n0Cko-LZtZjrVHMjzlMUUxB6GGkx9MlNy68nALEeh_Doj42UDZkCwF872N4pVzyqKEexAX8PxAgtqote2rHMAA"
const expiredVp =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjYyMTU0MTEsInZwIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZVByZXNlbnRhdGlvbiJdfSwic3ViIjoiZGlkOmV0aHI6MHg0MzVkZjNlZGE1NzE1NGNmOGNmNzkyNjA3OTg4MWYyOTEyZjU0ZGI0IiwibmJmIjoxNjI2MjE1NDAxLCJpc3MiOiJkaWQ6a2V5Ono2TWtzR0toMjNtSFp6MkZwZU5ENld4SnR0ZDhUV2hrVGdhN210Yk0xeDF6TTY1bSJ9.UjdICQPEQOXk52Riq4t88Yol8T_gdmNag3G_ohzMTYDZRZNok7n-R4WynPrFyGASEMqDfi6ZGanSOlcFm2W6DQ"

describe("VC decoding", () => {
  it("decodes a VC", async () => {
    const decoded = await decodeVerifiableCredential(signedVc)
    expect(decoded.type.length).toEqual(1)
    expect(decoded.type[0]).toEqual("VerifiableCredential")
    expect(decoded.credentialSubject.degree.type).toEqual("BachelorDegree")
    expect(decoded.credentialSubject.degree.name).toEqual(
      "Baccalauréat en musiques numériques"
    )
  })

  it("rejects an expired VC", async () => {
    expect.assertions(1)
    await expect(decodeVerifiableCredential(expiredVc)).rejects.toThrowError(
      ValidationError
    )
  })

  it("rejects an expired VP", async () => {
    expect.assertions(1)
    await expect(decodeVerifiablePresentation(expiredVp)).rejects.toThrowError(
      ValidationError
    )
  })
})
