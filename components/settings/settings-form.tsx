'use client'

import { useState, useRef, useEffect } from 'react'
import { useActionState } from 'react'
import { updateProfile, changePassword } from '@/app/actions/user'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Save, Lock, User, Loader2 } from 'lucide-react'
import Image from 'next/image'

type UserData = {
    id: string
    name: string | null
    image: string | null
}

type State = {
    error?: string
    success?: string
    user?: {
        name?: string | null
        image?: string | null
    }
}

const initialState: State = {
    error: '',
    success: ''
}

export function SettingsForm({ user }: { user: UserData }) {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <ProfileSection user={user} />
            <PasswordSection />
        </div>
    )
}

function ProfileSection({ user }: { user: UserData }) {
    const { update } = useSession()
    const [state, action, isPending] = useActionState(updateProfile, initialState)
    const [preview, setPreview] = useState<string | null>(user.image)
    const successRef = useRef<string | null>(null)
    
    useEffect(() => {
        if (state?.success && state.success !== successRef.current) {
            // Update session with new data
            if (state.user) {
                update({
                    name: state.user.name,
                    image: state.user.image
                })
            } else {
                update()
            }
            successRef.current = state.success
        }
    }, [state?.success, state?.user, update])

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Update preview when new file selected
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const objectUrl = URL.createObjectURL(file)
            setPreview(objectUrl)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profil bearbeiten</CardTitle>
                <CardDescription>Aktualisieren Sie Ihre persönlichen Daten und Ihr Profilbild.</CardDescription>
            </CardHeader>
            <form action={action}>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-100 shadow-sm relative bg-zinc-100 flex items-center justify-center">
                                {preview ? (
                                    <Image 
                                        src={preview} 
                                        alt="Profile Preview" 
                                        fill 
                                        className="object-cover" 
                                        sizes="128px"
                                    />
                                ) : (
                                    <User className="w-12 h-12 text-zinc-400" />
                                )}
                            </div>
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <input 
                            type="file" 
                            name="image" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <p className="text-xs text-muted-foreground">Klicken zum Ändern (Max 5MB)</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input 
                            id="name" 
                            name="name" 
                            defaultValue={user.name || ''} 
                            placeholder="Ihr Name" 
                        />
                    </div>

                    {state?.error && (
                        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
                            {state.error}
                        </div>
                    )}
                    {state?.success && (
                        <div className="p-3 rounded-md bg-green-50 text-green-600 text-sm">
                            {state.success}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Speichern
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

function PasswordSection() {
    const [state, action, isPending] = useActionState(changePassword, initialState)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Passwort ändern</CardTitle>
                <CardDescription>Wählen Sie ein sicheres Passwort für Ihr Konto.</CardDescription>
            </CardHeader>
            <form action={action}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                        <Input 
                            id="currentPassword" 
                            name="currentPassword" 
                            type="password" 
                            required 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Neues Passwort</Label>
                        <Input 
                            id="newPassword" 
                            name="newPassword" 
                            type="password" 
                            required 
                            minLength={8}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                        <Input 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            type="password" 
                            required 
                            minLength={8}
                        />
                    </div>

                    {state?.error && (
                        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
                            {state.error}
                        </div>
                    )}
                    {state?.success && (
                        <div className="p-3 rounded-md bg-green-50 text-green-600 text-sm">
                            {state.success}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isPending} variant="outline">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Passwort ändern
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
