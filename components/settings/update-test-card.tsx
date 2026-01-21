'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export function UpdateTestCard() {
  const [showBanner, setShowBanner] = useState(false)

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl text-zinc-100">Update-System Test</CardTitle>
        <CardDescription className="text-zinc-400">
          Teste das Update-Banner und Toast-Notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setShowBanner(!showBanner)
              toast.success('Update-Banner wurde ' + (showBanner ? 'ausgeblendet' : 'eingeblendet'))
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {showBanner ? 'Banner ausblenden' : 'Banner einblenden'}
          </Button>
          
          <Button
            onClick={() => {
              toast.info('Neue Version v0.2.0 verfügbar!', {
                description: 'Klicken Sie auf "Jetzt aktualisieren" um die neueste Version zu installieren.',
                duration: 5000,
              })
            }}
            variant="outline"
            className="border-zinc-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Test Toast
          </Button>
        </div>

        {showBanner && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm">
                <span className="font-medium text-blue-900">
                  Neue Version verfügbar: v0.2.0
                </span>
                <span className="text-blue-700 ml-2">
                  (Aktuell: v0.1.0)
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => toast.success('Update wird gestartet...')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Jetzt aktualisieren
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
