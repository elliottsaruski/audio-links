'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDashboardStore } from '@/lib/dashboard-store'
import { addRelease, updateRelease, deleteRelease } from '@/app/dashboard/actions'
import { uploadFile } from '@/lib/upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tables } from '@/types/database'

type Release = Tables<'upcoming_releases'>

export default function ReleasesTab({ userId }: { userId: string }) {
  const router = useRouter()
  const releases = useDashboardStore(s => s.releases)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editPresave, setEditPresave] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newPresave, setNewPresave] = useState('')
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Release | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setSaving(true)
    setError(null)

    let coverUrl: string | null = null
    try {
      if (newCoverFile) coverUrl = await uploadFile('covers', userId, newCoverFile)

      const { error } = await addRelease({
        title: newTitle.trim(),
        release_date: newDate || null,
        presave_url: newPresave.trim() || null,
        cover_url: coverUrl,
      })

      if (error) {
        setError(error)
      } else {
        setNewTitle('')
        setNewDate('')
        setNewPresave('')
        setNewCoverFile(null)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add release')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(r: Release) {
    setEditingId(r.id)
    setEditTitle(r.title)
    setEditDate(r.release_date ?? '')
    setEditPresave(r.presave_url ?? '')
  }

  async function handleSaveEdit(id: string) {
    setSaving(true)
    const { error } = await updateRelease(id, {
      title: editTitle.trim(),
      release_date: editDate || null,
      presave_url: editPresave.trim() || null,
    })
    setSaving(false)
    if (error) {
      setError(error)
    } else {
      setEditingId(null)
      router.refresh()
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await deleteRelease(deleteTarget.id)
    setDeleting(false)
    if (error) setError(error)
    else {
      setDeleteTarget(null)
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {/* Release list */}
      <div className="space-y-2">
        {releases.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-6">No upcoming releases.</p>
        )}
        {releases.map(release =>
          editingId === release.id ? (
            <div key={release.id} className="border border-zinc-700 rounded-lg p-3 space-y-2 bg-zinc-900">
              <Input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                placeholder="Title"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Input
                type="date"
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Input
                value={editPresave}
                onChange={e => setEditPresave(e.target.value)}
                placeholder="Pre-save URL"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSaveEdit(release.id)} disabled={saving}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-zinc-400">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              key={release.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800"
            >
              {release.cover_url ? (
                <div className="w-10 h-10 rounded bg-zinc-800 shrink-0 overflow-hidden">
                  <Image src={release.cover_url} alt={release.title} width={40} height={40} className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded bg-zinc-800 shrink-0 flex items-center justify-center text-zinc-600 text-xs">♪</div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{release.title}</p>
                {release.release_date && (
                  <p className="text-xs text-zinc-500">{release.release_date}</p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(release)} className="p-1.5 text-xs text-zinc-500 hover:text-zinc-200 transition">
                  Edit
                </button>
                <button onClick={() => setDeleteTarget(release)} className="p-1.5 text-xs text-zinc-600 hover:text-red-400 transition">
                  ✕
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Add form */}
      <form onSubmit={handleAdd} className="border border-zinc-800 rounded-lg p-4 space-y-3 bg-zinc-900">
        <p className="text-sm text-zinc-400 font-medium">Add upcoming release</p>
        <div className="space-y-2">
          <Label className="text-zinc-300 text-xs">Title *</Label>
          <Input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Album or single name"
            required
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-300 text-xs">Release date</Label>
          <Input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-300 text-xs">Pre-save URL</Label>
          <Input
            value={newPresave}
            onChange={e => setNewPresave(e.target.value)}
            placeholder="https://…"
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-300 text-xs">Cover image</Label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={e => setNewCoverFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-zinc-700 file:text-zinc-300 hover:file:bg-zinc-600"
          />
        </div>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Saving…' : 'Add release'}
        </Button>
      </form>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <p className="text-white font-medium">Delete &ldquo;{deleteTarget.title}&rdquo;?</p>
            <p className="text-sm text-zinc-400">This can&apos;t be undone.</p>
            <div className="flex gap-3">
              <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(null)} className="text-zinc-400">
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
