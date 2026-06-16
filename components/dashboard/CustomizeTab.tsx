'use client'

import { useDashboardStore } from '@/lib/dashboard-store'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface ColorFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-zinc-300 text-sm">{label}</Label>
      <div className="flex items-center gap-3">
        {/* Color picker */}
        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-600">
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          />
          <div className="absolute inset-0 rounded-lg" style={{ backgroundColor: value }} />
        </div>

        {/* Hex input */}
        <Input
          value={value}
          onChange={e => {
            const v = e.target.value
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v)
          }}
          maxLength={7}
          placeholder="#000000"
          className="bg-zinc-800 border-zinc-700 text-white font-mono text-sm w-32"
        />

        {/* Live swatch */}
        <div
          className="w-8 h-8 rounded-md border border-zinc-700 shrink-0"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  )
}

export default function CustomizeTab() {
  const accentColor = useDashboardStore(s => s.accent_color)
  const cardColor = useDashboardStore(s => s.card_color)
  const textColor = useDashboardStore(s => s.text_color)
  const wrapperColor = useDashboardStore(s => s.wrapper_color)

  const setAccentColor = useDashboardStore(s => s.setAccentColor)
  const setCardColor = useDashboardStore(s => s.setCardColor)
  const setTextColor = useDashboardStore(s => s.setTextColor)
  const setWrapperColor = useDashboardStore(s => s.setWrapperColor)

  return (
    <div className="space-y-6">
      <p className="text-xs text-zinc-500">
        Changes are previewed on the right. Hit Save to publish.
      </p>

      <ColorField label="Page background" value={wrapperColor} onChange={setWrapperColor} />
      <ColorField label="Card color" value={cardColor} onChange={setCardColor} />
      <ColorField label="Text color" value={textColor} onChange={setTextColor} />
      <ColorField label="Accent color" value={accentColor} onChange={setAccentColor} />
    </div>
  )
}
