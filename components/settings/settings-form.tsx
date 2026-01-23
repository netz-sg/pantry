'use client'

import { useState, useRef, useEffect } from 'react'
import { useActionState } from 'react'
import { updateProfile, changePassword } from '@/app/actions/user'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Save, Lock, User, Loader2, Shield, AtSign, UserCircle, Eye, EyeOff, Globe } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { UpdateTestCard } from './update-test-card'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/language-switcher'

type UserData = {
    id: string
    name: string | null
    username: string
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
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
            <LanguageSection />
            <UpdateTestCard />
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
    const t = useTranslations('settings')
    const tCommon = useTranslations('common')


    useEffect(() => {
        if (state?.success && state.success !== successRef.current) {
            if (state.user) {
                update({
                    name: state.user.name,
                    image: state.user.image
                })
            } else {
                update()
            }
            toast.success(state.success)
            successRef.current = state.success
        }
        if (state?.error) {
            toast.error(state.error)
        }
    }, [state?.success, state?.error, state?.user, update])

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const objectUrl = URL.createObjectURL(file)
            setPreview(objectUrl)
        }
    }

    return (
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
            <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <UserCircle className="w-5 h-5 text-blue-400" />
                    </div>
                    <CardTitle className="text-xl text-zinc-100">{t('editProfile')}</CardTitle>
                </div>
                <CardDescription className="text-zinc-400">
                    {t('editProfileDescription')}
                </CardDescription>
            </CardHeader>
            <form action={action}>
                <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4 py-6">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-800 shadow-xl relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:border-blue-500/50 transition-all duration-300">
                                {preview ? (
                                    <Image
                                        src={preview}
                                        alt="Profile Preview"
                                        fill
                                        className="object-cover"
                                        sizes="128px"
                                    />
                                ) : (
                                    <User className="w-12 h-12 text-zinc-500" />
                                )}
                            </div>
                            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="flex flex-col items-center gap-2">
                                    <Camera className="w-8 h-8 text-white" />
                                    <span className="text-xs text-white font-medium">{tCommon('edit')}</span>
                                </div>
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
                        <p className="text-xs text-zinc-500">{t('clickToChange')}</p>
                    </div>

                    {/* Form Fields */}
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-zinc-300 flex items-center gap-2">
                                <AtSign className="w-4 h-4 text-blue-400" />
                                {t('usernameForLogin')}
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                defaultValue={user.username || ''}
                                placeholder={t('usernamePlaceholder')}
                                minLength={3}
                                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-zinc-300 flex items-center gap-2">
                                <User className="w-4 h-4 text-purple-400" />
                                {t('displayName')}
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={user.name || ''}
                                placeholder={t('namePlaceholder')}
                                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="px-6 py-4 bg-zinc-900/20">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {tCommon('saving')}
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {tCommon('saveChanges')}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

function LanguageSection() {
    const t = useTranslations('settings')

    return (
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
            <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                        <Globe className="w-5 h-5 text-green-400" />
                    </div>
                    <CardTitle className="text-xl text-zinc-100">{t('language')}</CardTitle>
                </div>
                <CardDescription className="text-zinc-400">
                    Choose your preferred language
                </CardDescription>
            </CardHeader>
            <CardContent>
                <LanguageSwitcher />
            </CardContent>
        </Card>
    )
}

function PasswordSection() {
    const [state, action, isPending] = useActionState(changePassword, initialState)
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    })
    const t = useTranslations('settings')

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success)
        }
        if (state?.error) {
            toast.error(state.error)
        }
    }, [state?.success, state?.error])

    return (
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
            <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                        <Shield className="w-5 h-5 text-red-400" />
                    </div>
                    <CardTitle className="text-xl text-zinc-100">{t('changePassword')}</CardTitle>
                </div>
                <CardDescription className="text-zinc-400">
                    {t('changePasswordDesc')}
                </CardDescription>
            </CardHeader>
            <form action={action}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-zinc-300 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-zinc-400" />
                            {t('currentPassword')}
                        </Label>
                        <div className="relative">
                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                type={showPasswords.current ? "text" : "password"}
                                required
                                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 pr-10 focus:border-red-500 focus:ring-red-500/20"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-zinc-300 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-green-400" />
                            {t('newPassword')}
                        </Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type={showPasswords.new ? "text" : "password"}
                                required
                                minLength={8}
                                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 pr-10 focus:border-green-500 focus:ring-green-500/20"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-zinc-500">{t('minPasswordLength')}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-zinc-300 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-green-400" />
                            {t('confirmPassword')}
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPasswords.confirm ? "text" : "password"}
                                required
                                minLength={8}
                                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 pr-10 focus:border-green-500 focus:ring-green-500/20"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="px-6 py-4 bg-zinc-900/20">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg shadow-red-500/20"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('changingPassword')}
                            </>
                        ) : (
                            <>
                                <Shield className="mr-2 h-4 w-4" />
                                {t('changePassword')}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
