import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default function ProfileAvatar({ avatarUrl }: { avatarUrl: string }) {
  return (
    <Avatar size="lg">
      <AvatarImage src={avatarUrl} alt="Profile Avatar" />
    </Avatar>
  );
}
