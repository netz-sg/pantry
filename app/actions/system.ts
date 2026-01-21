'use server'

import { auth } from "@/lib/auth"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"

const execAsync = promisify(exec)

type SystemInfo = {
  currentVersion: string
  hasUpdate: boolean
  latestVersion?: string
  isDocker: boolean
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Nicht authentifiziert")
  }

  try {
    // Read current version from package.json
    const packagePath = path.join(process.cwd(), "package.json")
    const packageJson = JSON.parse(await fs.readFile(packagePath, "utf-8"))
    const currentVersion = packageJson.version

    // Check if running in Docker
    const isDocker = process.env.HOSTNAME?.startsWith("pantry") || false

    // Check for updates (check if git repo has new commits)
    let hasUpdate = false
    let latestVersion = currentVersion

    // Only check for updates if git repository exists
    try {
      // Check if .git directory exists
      const gitExists = await fs.access(path.join(process.cwd(), ".git"))
        .then(() => true)
        .catch(() => false)
      
      if (gitExists) {
        // Fetch latest from git
        await execAsync("git fetch origin", { timeout: 5000 })
        
        // Check if there are updates
        const { stdout } = await execAsync("git rev-list HEAD...origin/main --count")
        const commitsBehind = parseInt(stdout.trim())
        
        hasUpdate = commitsBehind > 0
        
        if (hasUpdate) {
          // Try to get version from remote package.json
          try {
            const { stdout: remoteVersion } = await execAsync(
              "git show origin/main:package.json"
            )
            const remotePkg = JSON.parse(remoteVersion)
            latestVersion = remotePkg.version
          } catch {
            latestVersion = currentVersion
          }
        }
      }
      // Silently skip update check if no git repo
    } catch (error) {
      // Silently ignore errors
    }

    return {
      currentVersion,
      hasUpdate,
      latestVersion,
      isDocker
    }
  } catch (error) {
    console.error("System info error:", error)
    throw new Error("Fehler beim Abrufen der Systeminformationen")
  }
}

export async function updateApplication(): Promise<{ success: boolean; message: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Nicht authentifiziert")
  }

  try {
    const isDocker = process.env.HOSTNAME?.includes("pantry") || false

    if (isDocker) {
      // In Docker - create trigger file for external monitor
      const triggerPath = path.join(process.cwd(), "..", "trigger-update.txt")
      await fs.writeFile(triggerPath, new Date().toISOString())
      
      return {
        success: true,
        message: "Update wird gestartet... Die Anwendung wird in wenigen Sekunden neu geladen."
      }
    } else {
      // Local development - just pull and rebuild
      await execAsync("git pull origin main", { timeout: 30000 })
      
      return {
        success: true,
        message: "Update erfolgreich heruntergeladen. Bitte starten Sie die Anwendung neu."
      }
    }
  } catch (error) {
    console.error("Update error:", error)
    return {
      success: false,
      message: "Fehler beim Aktualisieren der Anwendung"
    }
  }
}
