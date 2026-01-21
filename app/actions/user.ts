'use server'

import { auth } from "@/lib/auth"
import { db } from "@/db/drizzle"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

type ActionState = {
    error?: string
    success?: string
    user?: {
        name?: string | null
        image?: string | null
    }
}

export async function updateProfile(prevState: any, formData: FormData): Promise<ActionState> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Nicht authentifiziert" }

  const name = formData.get("name") as string
  const imageFile = formData.get("image") as File | null

  try {
    const updateData: { name?: string; image?: string } = {}
    
    if (name) updateData.name = name

    if (imageFile && imageFile.size > 0) {
        if (!imageFile.type.startsWith("image/")) {
             return { error: "Ungültiges Dateiformat. Bitte laden Sie ein Bild hoch." }
        }
        
        if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
             return { error: "Bild ist zu groß (Max 5MB)." }
        }
        
        const buffer = Buffer.from(await imageFile.arrayBuffer())
        // Sanitize filename or generate unique one
        const ext = path.extname(imageFile.name) || '.jpg'
        const filename = `avatar-${session.user.id}-${Date.now()}${ext}`
        const uploadDir = path.join(process.cwd(), "public", "uploads")
        
        // Ensure dir exists
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) {
            // ignore if exists
        }

        const filepath = path.join(uploadDir, filename)
        
        await writeFile(filepath, buffer)
        updateData.image = `/api/uploads/${filename}`
    }

    if (Object.keys(updateData).length > 0) {
        await db.update(users)
        .set(updateData)
        .where(eq(users.id, session.user.id))
    }

    revalidatePath("/settings")
    revalidatePath("/", "layout") // Update header avatar
    
    // Return the updated data so client can update session
    return { 
        success: "Profil erfolgreich aktualisiert!",
        user: {
            name: name || session.user.name,
            image: updateData.image || session.user.image
        }
    }
  } catch (error) {
    console.error("Profile update error:", error)
    return { error: "Fehler beim Aktualisieren des Profils." }
  }
}

export async function changePassword(prevState: any, formData: FormData): Promise<ActionState> {
    const session = await auth()
    if (!session?.user?.id) return { error: "Nicht authentifiziert" }

    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "Bitte füllen Sie alle Felder aus." }
    }

    if (newPassword !== confirmPassword) {
        return { error: "Die neuen Passwörter stimmen nicht überein." }
    }

    if (newPassword.length < 8) {
        return { error: "Das neue Passwort muss mindestens 8 Zeichen lang sein." }
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id)
        })

        if (!user) return { error: "Benutzer nicht gefunden." }

        const validPassword = await bcrypt.compare(currentPassword, user.passwordHash)
        if (!validPassword) {
            return { error: "Das aktuelle Passwort ist falsch." }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await db.update(users)
            .set({ passwordHash: hashedPassword })
            .where(eq(users.id, session.user.id))
        
        return { success: "Passwort erfolgreich geändert!" }

    } catch (error) {
        console.error("Password change error:", error)
        return { error: "Ein Fehler ist aufgetreten." }
    }
}
