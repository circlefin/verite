import { loadEnvConfig } from "@next/env"

export default async function loadEnvironmentVariables(): Promise<void> {
  const projectDir = process.cwd()
  loadEnvConfig(projectDir)
}
