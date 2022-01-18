import { FC } from "react"

export type NoTokensMessageProps = {
  registryAddress: string
  verifierAddress: string
}

const VerifierIsNotAVerifier: FC<NoTokensMessageProps> = ({
  registryAddress,
  verifierAddress
}) => {
  return (
    <div className="prose">
      <p>
        The verifier in this demo is configured using the environment variable
        VERIFIER_PRIVATE_KEY. It appears that address has not been configured as
        a verifier with the registry contract.
      </p>
      <p>
        From `packages/contract` directory, you can correct it by running the
        following command:
      </p>
      <pre>
        npx hardhat registryAddVerifier \{"\n"}
        {"  "}--address {verifierAddress} \{"\n"}
        {"  "}--name &quot;Test Verifier&quot; \{"\n"}
        {"  "}--did &quot;did:web:example.com&quot; \{"\n"}
        {"  "}--url &quot;http://example.com&quot; \{"\n"}
        {"  "}--registry {registryAddress} \{"\n"}
        {"  "}--network localhost
      </pre>

      <p>
        The UI should automatically update after the transaction is mined. If
        not, try reloading.
      </p>
    </div>
  )
}

export default VerifierIsNotAVerifier
