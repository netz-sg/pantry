'use server'

import { db } from "@/db/drizzle"
import { users } from "@/db/schema"

export async function checkRegistrationAllowed() {
  const userCount = await db.select().from(users)
  return userCount.length === 0
}
