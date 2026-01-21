import { auth } from "@/lib/auth"
import { db } from "@/db/drizzle"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { SettingsForm } from "@/components/settings/settings-form"

export default async function SettingsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/signin")
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!user) {
    redirect("/signin")
  }

  // Convert to plain object if needed, specifically dates if passed to client
  // But my UserData type in form expects string | null for image/name
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left">Einstellungen</h1>
      <SettingsForm 
        user={{
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
        }} 
      />
    </div>
  )
}
