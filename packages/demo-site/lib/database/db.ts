import { open, Database } from "sqlite"
import sqlite3 from "sqlite3"

let connection: Database<sqlite3.Database, sqlite3.Statement>

const db = async (): Promise<Database<sqlite3.Database, sqlite3.Statement>> => {
  if (connection) {
    return connection
  }
  connection = await open<sqlite3.Database, sqlite3.Statement>({
    filename: "/tmp/database.db",
    driver: sqlite3.Database
  })
  return connection
}

export default db
