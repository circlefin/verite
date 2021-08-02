import type { VerificationRequest } from "@centre/verity"
import { prisma } from "./prisma"

export async function saveVerificationRequest(
  verificationRequest: VerificationRequest,
  status = "pending"
): Promise<VerificationRequest> {
  await prisma.verificationRequest.create({
    data: {
      id: verificationRequest.request.id,
      payload: JSON.stringify(verificationRequest),
      status
    }
  })

  return verificationRequest
}

export async function findVerificationRequest(
  id: string
): Promise<VerificationRequest | undefined> {
  const record = await prisma.verificationRequest.findUnique({
    where: {
      id
    }
  })

  if (record) {
    return JSON.parse(record.payload)
  }
}

export async function fetchVerificationRequestStatus(
  id: string
): Promise<string | undefined> {
  const record = await prisma.verificationRequest.findUnique({
    where: {
      id
    }
  })

  return record?.status
}

export async function updateVerificationRequestStatus(
  id: string,
  status: string
): Promise<void> {
  await prisma.verificationRequest.update({
    where: {
      id
    },
    data: {
      status
    }
  })
}
