import { execSync } from "child_process"
import { loadEnvConfig } from "@next/env"

export default async function loadEnvironmentVariables(): Promise<void> {
  // Load environment variables
  loadEnvConfig(process.cwd())

  // Migrate a database
  execSync("npx prisma migrate reset --force")
}
