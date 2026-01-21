'use client'

import { useEffect, useState } from 'react'
import { getSystemInfo, updateApplication } from '@/app/actions/system'
import { Button } from '@/components/ui/button'
import { AlertCircle, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type SystemInfo = {
  currentVersion: string
  hasUpdate: boolean
  latestVersion?: string
  isDocker: boolean
}

export function UpdateBanner() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check for updates on mount and every 5 minutes
    const checkUpdates = async () => {
      try {
        const info = await getSystemInfo()
        setSystemInfo(info)
      } catch (error) {
        console.error('Failed to check for updates:', error)
      }
    }

    checkUpdates()
    const interval = setInterval(checkUpdates, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      const result = await updateApplication()
      
      if (result.success) {
        toast.success(result.message)
        // Reload page after 2 seconds
        setTimeout(() => window.location.reload(), 2000)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Fehler beim Aktualisieren der Anwendung')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!systemInfo?.hasUpdate || dismissed) {
    return null
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <div className="text-sm">
            <span className="font-medium text-blue-900">
              Neue Version verfügbar: v{systemInfo.latestVersion}
            </span>
            <span className="text-blue-700 ml-2">
              (Aktuell: v{systemInfo.currentVersion})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aktualisiere...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Jetzt aktualisieren
              </>
            )}
          </Button>
          {systemInfo.isDocker && (
            <p className="text-xs text-blue-700">
              (Benötigt Update-Monitor)
            </p>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
            className="text-blue-700 hover:text-blue-900"
          >
            Ausblenden
          </Button>
        </div>
      </div>
    </div>
  )
}
