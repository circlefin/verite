import type { Person } from "schema-dts"

export type CounterpartyPerson = Person & {
  accountNumber: string
  accountSource: string
}
