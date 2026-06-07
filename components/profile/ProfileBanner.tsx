export default function ProfileBanner({ url }: { url: string | null }) {
  if (!url) return null
  return (
    <img
      src={url}
      alt="Profile background"
      className="relative z-20 aspect-video w-full object-cover"
    />
  )
}
