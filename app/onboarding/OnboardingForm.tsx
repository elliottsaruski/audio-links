'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { claimHandle } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const HANDLE_REGEX = /^[a-z0-9][a-z0-9_-]{1,18}[a-z0-9]$/

export default function OnboardingForm() {
  const router = useRouter()
  const [handle, setHandle] = useState('')
  const [availability, setAvailability] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const normalized = handle.toLowerCase()

    if (!normalized) {
      setAvailability('idle')
      return
    }

    if (!HANDLE_REGEX.test(normalized)) {
      setAvailability('invalid')
      return
    }

    setAvailability('checking')
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('handle', normalized)
        .maybeSingle()

      setAvailability(data ? 'taken' : 'available')
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [handle])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (availability !== 'available') return
    setSubmitError(null)
    setLoading(true)

    const { error } = await claimHandle(handle.toLowerCase())

    if (error) {
      setSubmitError(error)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const statusMessage = {
    idle: null,
    checking: <span className="text-zinc-500">Checking…</span>,
    available: <span className="text-green-400">✓ Available</span>,
    taken: <span className="text-red-400">Already taken</span>,
    invalid: <span className="text-zinc-500">3–20 chars, letters/numbers/hyphens/underscores</span>,
  }[availability]

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-white text-2xl">Choose your handle</CardTitle>
          <CardDescription className="text-zinc-400">
            This is your public URL. You can&apos;t change it later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="handle" className="text-zinc-300">Handle</Label>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-sm select-none">yourdomain.com/</span>
                <Input
                  id="handle"
                  type="text"
                  placeholder="yourname"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase())}
                  autoComplete="off"
                  spellCheck={false}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              {statusMessage && (
                <p className="text-sm">{statusMessage}</p>
              )}
            </div>

            {submitError && (
              <p className="text-sm text-red-400">{submitError}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || availability !== 'available'}
            >
              {loading ? 'Claiming…' : 'Claim handle'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
