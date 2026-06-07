'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Tables } from '@/types/database'
import { updateProfile } from '@/app/dashboard/actions'
import { uploadFile } from '@/lib/upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Profile = Tables<'profiles'>

export default function ProfileTab({ profile, userId }: { profile: Profile; userId: string }) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(profile.display_name ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [bgUrl, setBgUrl] = useState(profile.background_url)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBg, setUploadingBg] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error } = await updateProfile({
      display_name: displayName || null,
      bio: bio || null,
    })

    setSaving(false)
    if (error) {
      setError(error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const url = await uploadFile('avatars', userId, file)
      const { error } = await updateProfile({ avatar_url: url })
      if (error) throw new Error(error)
      setAvatarUrl(url)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Avatar upload failed')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleBgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBg(true)
    try {
      const url = await uploadFile('backgrounds', userId, file)
      const { error } = await updateProfile({ background_url: url })
      if (error) throw new Error(error)
      setBgUrl(url)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Background upload failed')
    } finally {
      setUploadingBg(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <div className="space-y-2">
        <Label className="text-zinc-300">Avatar</Label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="relative w-16 h-16 rounded-full bg-zinc-800 overflow-hidden hover:opacity-80 transition flex-shrink-0"
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
            ) : (
              <span className="text-2xl absolute inset-0 flex items-center justify-center text-zinc-500">
                +
              </span>
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
        <div
          className="relative w-full h-24 rounded-lg bg-zinc-800 overflow-hidden cursor-pointer hover:opacity-80 transition"
          onClick={() => bgInputRef.current?.click()}
        >
          {bgUrl ? (
            <Image src={bgUrl} alt="Background" fill className="object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
              {uploadingBg ? 'Uploading…' : '+ Add background'}
            </span>
          )}
        </div>
        <input
          ref={bgInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleBgChange}
        />
      </div>

      {/* Text fields */}
      <form onSubmit={handleSave} className="space-y-4">
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
          <Label htmlFor="bio" className="text-zinc-300">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell people about yourself…"
            rows={4}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save profile'}
        </Button>
      </form>
    </div>
  )
}
