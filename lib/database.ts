export type User = {
  id: number
  email: string
  password: string
}

export const USERS: User[] = [
  { id: 1, email: "alice@test.com", password: "testing" },
  { id: 2, email: "bob@test.com", password: "testing" }
]

export function createUser(email: string, password: string): User {
  const id = Math.max(...USERS.map((u) => u.id)) + 1
  const user = { id, email, password }

  USERS.push(user)
  return user
}

export function findUser(id: number): User | undefined {
  return USERS.find((u) => u.id === id)
}

export function authenticateUser(
  email: string,
  password: string
): User | undefined {
  return USERS.find((u) => u.email === email && u.password === password)
}
