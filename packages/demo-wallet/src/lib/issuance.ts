import uuid from "react-native-uuid"

const body = (did: string) => {
  const data = {
    credential_submission: {
      id: uuid.v4(),
      manifest_id: "Circle-KYCAMLAttestation",
      format: {
        jwt_vp: {
          alg: ["EdDSA", "ES256K"]
        }
      }
    },
    presentation_submission: {
      id: uuid.v4(),
      definition_id: uuid.v4(), // Clarity on whether this is correct?
      descriptor_map: [
        {
          id: "input_1",
          format: "jwt_vp",
          path: "$.presentation"
        }
      ]
    },
    presentation: {
      verifiableCredential: [
        {
          "@context": ["https://www.w3.org/2018/credentials/v1"],
          type: ["VerifiableCredential"],
          credentialSubject: {
            id: did
          }
        }
      ],
      holder: did, // For our demo, the subject and holder are identical
      proof: {
        // TODO VER-50
        type: "Ed25519Signature2018",
        created: new Date().toISOString(),
        challenge: uuid.v4(),
        jws: "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..MfVEy102c4oZA_G98G6HUxEmfXFLEIWbX9C36zF_cA-D8EF8jRMQWc5eJpMn3hgLm2xhPw8GzTrnwPHa37L-DA",
        proofPurpose: "authentication",
        verificationMethod:
          "did:key:z6MksMYtQSvQsfk3KZy7vxBzjcBJhx1i7TaLuvJePPPDEAjH#z6MksMYtQSvQsfk3KZy7vxBzjcBJhx1i7TaLuvJePPPDEAjH"
      }
    }
  }

  return data
}

export const requestIssuance = async (
  url: string,
  did: string,
  proof: string
): Promise<Response> => {
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body(did))
  })
}
