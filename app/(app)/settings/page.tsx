import { auth } from "@/lib/auth"
import { db } from "@/db/drizzle"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { SettingsForm } from "@/components/settings/settings-form"
import { User, Shield } from "lucide-react"
import { getTranslations } from 'next-intl/server'

export default async function SettingsPage() {
  const session = await auth()
  const t = await getTranslations('settings')

  if (!session?.user?.id) {
    redirect("/signin")
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!user) {
    redirect("/signin")
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 md:py-12">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
            <User className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      <SettingsForm
        user={{
          id: user.id,
          name: user.name,
          username: user.username,
          image: user.image,
        }}
      />
    </div>
  )
}

