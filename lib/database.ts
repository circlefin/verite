import { v4 as uuidv4 } from "uuid"

export type User = {
  id: string
  email: string
  password: string
}

export const USERS: User[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "alice@test.com",
    password: "testing"
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "bob@test.com",
    password: "testing"
  }
]

export function createUser(email: string, password: string): User {
  const id = uuidv4()
  const user = { id, email, password }

  USERS.push(user)
  return user
}

export function findUser(id: string): User | undefined {
  return USERS.find((u) => u.id === id)
}

export function authenticateUser(
  email: string,
  password: string
): User | undefined {
  return USERS.find((u) => u.email === email && u.password === password)
}
