---
sidebar_label: Verification
sidebar_position: 3
---

# Verify a Verifiable Credential

_This tutorial will walk you through consuming and verifying verifiable credentials using the verity sdks. For additional context about the verification and credential exchange flow, see [Consuming Verifiable Credentials](/patterns/verification-flow.md)._

## Step 1: Expose Verification Requirements

The verifier first needs to inform credential holders of their input requirements. Verity uses the [Presentation Exchange (PEx)](https://identity.foundation/presentation-exchange/) approach for this purpose, in which verifiers express these requirements as a Presentation Definition.

Verity exposes library helpers that create a few predefined types of presentation definitions, for example a KYC verification offer:

```ts
import { buildKycVerificationOffer } from "@centre/verity";

const offer = buildKycVerificationOffer(
  uuidv4(),
  verifierDidKey.subject,
  "https://test.host/verify"
);
```

## Step 2: Receive Presentation Submission

The verification offer wraps a presentation definition, which contains instructions for the credential holder to determine what sort of inputs the verifier requires.

The verification offer also informs the credential holder where to submit the response.

The credential holder uses the presentation definition to gather the required inputs, form a Presentation Submission, submit proof, and send it back to the verifier. Verity exposes libraries to help with this:

```ts
import { buildPresentationSubmission } from "@centre/verity";

const submission = await buildPresentationSubmission(
  clientDidKey,
  offer.body.presentation_definition,
  verifiableCredentials
);
```

## Step 3: Verify Submission

The verifier verifies the submission and proceeds with the corresponding workflow, returning a status to the credential holder about whether the verification succeeded.

```ts
await validateVerificationSubmission(
  submission,
  offer.body.presentation_definition
);
```

## Summary

Putting this together, we can do the following:

```ts
// 1. VERIFIER: Discovery of verification requirements
const offer = buildKycVerificationOffer(
  uuidv4(),
  verifierDidKey.controller,
  "https://test.host/verify"
);

// 2. CLIENT: Create verification submission (wraps a presentation submission)
const submission = await buildPresentationSubmission(
  clientDidKey,
  offer.body.presentation_definition,
  verifiableCredentials
);

// 3. VERIFIER: Verifies submission
await validateVerificationSubmission(
  submission,
  offer.body.presentation_definition
);
```

You can view this demo as a full working example in our [demo-issuer](https://github.com/centrehq/demo-site/tree/main/packages/demo-verifier) demo.
