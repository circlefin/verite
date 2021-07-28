import { open } from "sqlite"
import sqlite3 from "sqlite3"
;(async () => {
  const db = await open({
    filename: "/tmp/database.db",
    driver: sqlite3.Database
  })

  await db.exec(
    "CREATE TABLE IF NOT EXISTS credentials (userId TEXT, jwt TEXT)"
  )
})()
