export default function ProfileBanner({ bannerUrl }: { bannerUrl: string }) {
  return (
    <img
      src={bannerUrl}
      alt="Banner Image"
      className="relative z-20 aspect-video w-full object-cover"
    />
  );
}
