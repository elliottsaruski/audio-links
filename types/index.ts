export type SocialPlatform =
  | "soundcloud"
  | "spotify"
  | "instagram"
  | "twitter"
  | "youtube"
  | "bandcamp"
  | "website";

export interface Social {
  platform: SocialPlatform;
  url: string;
  handle?: string;
}

export interface Track {
  id: string;
  title: string;
  duration: number; // in seconds
  plays: number;
  likes: number;
  genre: string;
  tags: string[];
  coverUrl: string;
  audioUrl?: string; // empty for now, mock only
  waveformData: number[]; // array of 0-1 values for waveform visualization
  createdAt: string; // ISO date string
  isPinned?: boolean;
}

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bannerUrl: string;
  bio: string;
  location?: string;
  followers: number;
  following: number;
  totalPlays: number;
  socials: Social[];
  tracks: Track[];
  pinnedTrackId?: string;
}

export interface WaveformPlayerProps {
  track: Track;
}