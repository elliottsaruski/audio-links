import Image from 'next/image'

export default function ProfileAvatar({ url, name }: { url: string | null; name: string }) {
  return (
    <div className="w-16 h-16 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0">
      {url ? (
        <Image src={url} alt={name} width={64} height={64} className="object-cover w-full h-full" />
      ) : (
        <span className="w-full h-full flex items-center justify-center text-2xl text-zinc-400 select-none">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
}
