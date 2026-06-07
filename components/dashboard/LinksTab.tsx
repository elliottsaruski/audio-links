'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tables } from '@/types/database'
import { addLink, updateLink, deleteLink, reorderLinks } from '@/app/dashboard/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type LinkRow = Tables<'links'>

export default function LinksTab({ links: initialLinks }: { links: LinkRow[] }) {
  const router = useRouter()
  const [links, setLinks] = useState(initialLinks)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !newUrl.trim()) return
    setSaving(true)
    setError(null)

    const { error } = await addLink({
      title: newTitle.trim(),
      url: newUrl.trim(),
      sort_order: links.length,
    })

    setSaving(false)
    if (error) {
      setError(error)
    } else {
      setNewTitle('')
      setNewUrl('')
      router.refresh()
    }
  }

  function startEdit(link: LinkRow) {
    setEditingId(link.id)
    setEditTitle(link.title)
    setEditUrl(link.url)
  }

  async function handleSaveEdit(id: string) {
    setSaving(true)
    const { error } = await updateLink(id, {
      title: editTitle.trim(),
      url: editUrl.trim(),
    })
    setSaving(false)
    if (error) {
      setError(error)
    } else {
      setEditingId(null)
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    const { error } = await deleteLink(id)
    if (error) {
      setError(error)
    } else {
      router.refresh()
    }
  }

  async function move(index: number, direction: 'up' | 'down') {
    const next = direction === 'up' ? index - 1 : index + 1
    if (next < 0 || next >= links.length) return

    const reordered = [...links]
    ;[reordered[index], reordered[next]] = [reordered[next]!, reordered[index]!]
    setLinks(reordered)

    await reorderLinks(reordered.map(l => l.id))
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Link list */}
      <div className="space-y-2">
        {links.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-6">No links yet.</p>
        )}
        {links.map((link, i) =>
          editingId === link.id ? (
            <div key={link.id} className="border border-zinc-700 rounded-lg p-3 space-y-2 bg-zinc-900">
              <Input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                placeholder="Title"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Input
                value={editUrl}
                onChange={e => setEditUrl(e.target.value)}
                placeholder="https://…"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSaveEdit(link.id)} disabled={saving}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                  className="text-zinc-400"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              key={link.id}
              className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900 border border-zinc-800"
            >
              {/* Reorder */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => move(i, 'up')}
                  disabled={i === 0}
                  className="text-zinc-600 hover:text-zinc-300 disabled:opacity-20 leading-none text-xs"
                >
                  ▲
                </button>
                <button
                  onClick={() => move(i, 'down')}
                  disabled={i === links.length - 1}
                  className="text-zinc-600 hover:text-zinc-300 disabled:opacity-20 leading-none text-xs"
                >
                  ▼
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{link.title}</p>
                <p className="text-xs text-zinc-500 truncate">{link.url}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(link)}
                  className="p-1.5 text-xs text-zinc-500 hover:text-zinc-200 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="p-1.5 text-xs text-zinc-600 hover:text-red-400 transition"
                >
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
        <p className="text-sm text-zinc-400 font-medium">Add a link</p>
        <div className="space-y-2">
          <Label className="text-zinc-300 text-xs">Title</Label>
          <Input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Spotify"
            required
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-300 text-xs">URL</Label>
          <Input
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="https://open.spotify.com/…"
            type="url"
            required
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>
        <Button type="submit" size="sm" disabled={saving} className="w-full">
          Add link
        </Button>
      </form>
    </div>
  )
}
