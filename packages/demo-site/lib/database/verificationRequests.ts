import { remove } from "lodash"
import { VerificationRequest } from "../../../verity/dist"

type Status = "pending" | "approved" | "rejected"
type DataStoreRecord = {
  id: string
  verificationRequest: VerificationRequest
  status: Status
}

const DATA_STORE: DataStoreRecord[] = []

export async function saveVerificationRequest(
  verificationRequest: VerificationRequest,
  status: Status = "pending"
): Promise<VerificationRequest> {
  DATA_STORE.push({
    id: verificationRequest.request.id,
    verificationRequest,
    status
  })
  return verificationRequest
}

export async function findVerificationRequest(
  id: string
): Promise<VerificationRequest | undefined> {
  const row = findRow(id)
  return row?.verificationRequest
}

export async function fetchVerificationRequestStatus(
  id: string
): Promise<Status | undefined> {
  const row = findRow(id)
  return row?.status
}

export async function updateVerificationRequestStatus(
  id: string,
  status: Status
): Promise<void> {
  const row = findRow(id)
  if (row) {
    row.status = status
  }
  remove(DATA_STORE, (record) => record.id === id)
  DATA_STORE.push(row)
}

function findRow(id: string): DataStoreRecord | undefined {
  return DATA_STORE.find((record) => record.id === id)
}
