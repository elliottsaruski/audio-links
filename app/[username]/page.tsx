import { mockProfile } from "@/lib/mock-data";

import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileBanner from "@/components/profile/ProfileBanner";
import WaveformPlayer from "@/components/player/WaveformPlayer";
import TrackList from "@/components/profile/TrackList";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Globe, Share } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage({}) {
  const profile = mockProfile;

  return (
    <Card className="relative m-auto w-full max-w-lg pt-0 my-10 gap-0">
      <ProfileBanner bannerUrl={profile.bannerUrl} />
      <CardHeader className="gap-2 py-5">
        <div className="flex items-center gap-2">
          <ProfileAvatar avatarUrl={profile.avatarUrl} />
          <CardTitle className="text-lg">{profile.displayName}</CardTitle>
        </div>
        <CardDescription>{profile.bio}</CardDescription>
        <CardAction>
          <Share />
        </CardAction>
        <div className="flex items-end gap-2">
          <Badge>
            <Globe />
            <p>{profile.location}</p>
          </Badge>
        </div>
      </CardHeader>
      {/* <CardContent>
        <p>
          {profile.followers} followers · {profile.following} following
        </p>
      </CardContent> */}
      <CardContent className="bg-blue-50">
        <WaveformPlayer track={profile.tracks[0]} />;
      </CardContent>
      <CardContent className="flex flex-col gap-5 py-5">
        <TrackList tracks={profile.tracks} />
      </CardContent>
      <CardFooter>
        <p>
          {profile.tracks.length} tracks
          {/* · */}
          {/* {profile.totalPlays.toLocaleString()}{" "} */}
          {/* plays */}
        </p>
      </CardFooter>
    </Card>
  );
}
