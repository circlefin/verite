import { JwtCredentialPayload } from 'did-jwt-vc'
import { signVc } from "lib/issuance/sign-utils"
import loadEnvConfig from "test/support/setup"

describe("sign VC", () => {
  // TODO(kim): re-enable after setting up test secret
  test.skip("signs a VC", async () => {
    await loadEnvConfig()
    const vcPayload: JwtCredentialPayload = {
      sub: 'did:ethr:0x435df3eda57154cf8cf7926079881f2912f54db4',
      nbf: 1562950282,
      vc: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential'],
        credentialSubject: {
          degree: {
            type: 'BachelorDegree',
            name: 'Baccalauréat en musiques numériques'
          }
        }
      }
    }
    const result = await signVc(vcPayload)
    // TODO(kim): need better checks
    expect(result).toBeDefined()
  })

})
