'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useDashboardStore } from '@/lib/dashboard-store'
import { uploadFile } from '@/lib/upload'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const BIO_MAX = 150

export default function ProfileTab({ userId }: { userId: string }) {
  const displayName = useDashboardStore(s => s.display_name)
  const bio = useDashboardStore(s => s.bio)
  const avatarUrl = useDashboardStore(s => s.avatar_url)
  const bgUrl = useDashboardStore(s => s.background_url)
  const location = useDashboardStore(s => s.location)
  const theme = useDashboardStore(s => s.theme)

  const setDisplayName = useDashboardStore(s => s.setDisplayName)
  const setBio = useDashboardStore(s => s.setBio)
  const setAvatarUrl = useDashboardStore(s => s.setAvatarUrl)
  const setBackgroundUrl = useDashboardStore(s => s.setBackgroundUrl)
  const setLocation = useDashboardStore(s => s.setLocation)
  const setTheme = useDashboardStore(s => s.setTheme)

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBg, setUploadingBg] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    setUploadError(null)
    try {
      const url = await uploadFile('avatars', userId, file)
      setAvatarUrl(url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Avatar upload failed')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleBgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBg(true)
    setUploadError(null)
    try {
      const url = await uploadFile('backgrounds', userId, file)
      setBackgroundUrl(url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Background upload failed')
    } finally {
      setUploadingBg(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="space-y-2">
        <Label className="text-zinc-300">Avatar</Label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="relative w-16 h-16 rounded-full bg-zinc-800 overflow-hidden hover:opacity-80 transition shrink-0"
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xl">+</span>
            )}
          </button>
          <span className="text-xs text-zinc-500">
            {uploadingAvatar ? 'Uploading…' : 'Click to upload'}
          </span>
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Background */}
      <div className="space-y-2">
        <Label className="text-zinc-300">Background image</Label>
        <button
          type="button"
          onClick={() => bgInputRef.current?.click()}
          className="relative w-full h-20 rounded-lg bg-zinc-800 overflow-hidden hover:opacity-80 transition block"
        >
          {bgUrl ? (
            <Image src={bgUrl} alt="Background" fill className="object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
              {uploadingBg ? 'Uploading…' : '+ Add background'}
            </span>
          )}
        </button>
        <input
          ref={bgInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleBgChange}
        />
      </div>

      {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}

      {/* Text fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="display_name" className="text-zinc-300">Display name</Label>
          <Input
            id="display_name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="bio" className="text-zinc-300">Bio</Label>
            <span className={`text-xs ${bio.length > BIO_MAX ? 'text-red-400' : 'text-zinc-500'}`}>
              {bio.length} / {BIO_MAX}
            </span>
          </div>
          <Textarea
            id="bio"
            value={bio}
            onChange={e => {
              if (e.target.value.length <= BIO_MAX) setBio(e.target.value)
            }}
            placeholder="Tell people about yourself…"
            rows={3}
            maxLength={BIO_MAX}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-zinc-300">Location</Label>
          <Input
            id="location"
            value={location ?? ''}
            onChange={e => setLocation(e.target.value || null)}
            placeholder="Miami, FL"
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Theme</Label>
          <div className="flex gap-2">
            {(['dark', 'light'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`px-4 py-1.5 rounded-lg text-sm border transition ${
                  theme === t
                    ? 'border-white text-white bg-zinc-800'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
