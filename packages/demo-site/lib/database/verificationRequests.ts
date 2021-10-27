import type {
  VerificationOffer,
  VerificationResultResponse
} from "@centre/verity"
import { prisma } from "./prisma"

export async function saveVerificationOffer(
  verificationRequest: VerificationOffer,
  status = "pending"
): Promise<VerificationOffer> {
  await prisma.verificationRequest.create({
    data: {
      id: verificationRequest.id,
      payload: JSON.stringify(verificationRequest),
      status
    }
  })

  return verificationRequest
}

export async function findVerificationOffer(
  id: string
): Promise<VerificationOffer | undefined> {
  const record = await prisma.verificationRequest.findUnique({
    where: {
      id
    }
  })

  if (record) {
    return JSON.parse(record.payload)
  }
}

export async function fetchVerificationOfferStatus(
  id: string
): Promise<{ result: VerificationResultResponse; status: string } | undefined> {
  const record = await prisma.verificationRequest.findUnique({
    where: {
      id
    }
  })

  if (record) {
    return {
      result: record.result ? JSON.parse(record.result) : undefined,
      status: record.status
    }
  }
}

export async function updateVerificationOfferStatus(
  id: string,
  status: string,
  result?: VerificationResultResponse
): Promise<void> {
  await prisma.verificationRequest.update({
    where: {
      id
    },
    data: {
      result: result ? JSON.stringify(result) : undefined,
      status
    }
  })
}
