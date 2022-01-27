# Solana Example

This package illustrate how programs use results of Verifiable Credential verifications even when the contracts are not technically or economically capable of executing the verifications themselves.

This program follows a pattern in which verifications are performed off-chain and then confirmed on-chain. An off-chain verifier handles verifiable credential exchange in the usual manner, and upon successful verification, creates a minimal verification result object.

The verifier either registers the result directly with a Verification Registry program as part of the verification process (the "verifier submission" pattern), or returns it to subjects for use in smart contract transactions (the "subject submission" pattern).

This specific exampledemonstrates the minimally viable process of verifying the result.

Read more about Verifier and Subject Submission patterns in TODO LINK.
