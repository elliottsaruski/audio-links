import { Profile, Track } from "@/types";

// Generates a fake waveform as an array of 80 random values between 0.1 and 1
function generateWaveform(): number[] {
  return Array.from({ length: 80 }, () =>
    parseFloat((Math.random() * 0.9 + 0.1).toFixed(2)),
  );
}

export const mockTracks: Track[] = [
  {
    id: "track-1",
    title: "Neon Drift",
    duration: 214,
    plays: 18420,
    likes: 934,
    genre: "Electronic",
    tags: ["ambient", "synth", "lo-fi"],
    coverUrl: "https://picsum.photos/seed/track1/400/400",
    waveformData: generateWaveform(),
    createdAt: "2024-11-03T12:00:00Z",
    isPinned: true,
    audioUrl:
      "https://github.com/pumodi/open-samples/blob/a7eab6788701ffaccf9790fbf91e0bbac2f2ef27/Synthesizers/RolandSynthesizers/Roland%20JV-2080/Demos/Alien%20Encounter%20(JV-2080%20Demo)%20-%20Pumodi.mp3",
  },
  {
    id: "track-2",
    title: "Coastal Memory",
    duration: 187,
    plays: 9310,
    likes: 512,
    genre: "Chillwave",
    tags: ["chill", "dreamy", "guitar"],
    coverUrl: "https://picsum.photos/seed/track2/400/400",
    waveformData: generateWaveform(),
    createdAt: "2024-10-15T08:30:00Z",
  },
  {
    id: "track-3",
    title: "Hollow Signal",
    duration: 263,
    plays: 6745,
    likes: 388,
    genre: "Ambient",
    tags: ["dark", "textural", "experimental"],
    coverUrl: "https://picsum.photos/seed/track3/400/400",
    waveformData: generateWaveform(),
    createdAt: "2024-09-28T16:45:00Z",
  },
  {
    id: "track-4",
    title: "Last Train Home",
    duration: 198,
    plays: 4102,
    likes: 276,
    genre: "Indie",
    tags: ["acoustic", "emotional", "vocals"],
    coverUrl: "https://picsum.photos/seed/track4/400/400",
    waveformData: generateWaveform(),
    createdAt: "2024-08-11T10:00:00Z",
  },
  {
    id: "track-5",
    title: "Pulse City",
    duration: 231,
    plays: 3890,
    likes: 201,
    genre: "Electronic",
    tags: ["dance", "bass", "club"],
    coverUrl: "https://picsum.photos/seed/track5/400/400",
    waveformData: generateWaveform(),
    createdAt: "2024-07-22T20:00:00Z",
  },
];

export const mockProfile: Profile = {
  id: "user-1",
  username: "elliotwave",
  displayName: "Elliott Wave",
  avatarUrl: "https://picsum.photos/seed/avatar1/200/200",
  bannerUrl: "https://picsum.photos/seed/banner1/1200/400",
  bio: "Producer & sound designer based in Miami. Making music for late nights and long drives. Beats, ambience, and everything in between.",
  location: "Miami, FL",
  followers: 3241,
  following: 198,
  totalPlays: 42467,
  pinnedTrackId: "track-1",
  socials: [
    {
      platform: "soundcloud",
      url: "https://soundcloud.com/elliotwave",
      handle: "@elliotwave",
    },
    {
      platform: "spotify",
      url: "https://open.spotify.com/artist/elliotwave",
      handle: "Elliott Wave",
    },
    {
      platform: "instagram",
      url: "https://instagram.com/elliotwave",
      handle: "@elliotwave",
    },
    {
      platform: "twitter",
      url: "https://twitter.com/elliotwave",
      handle: "@elliotwave",
    },
    {
      platform: "bandcamp",
      url: "https://elliotwave.bandcamp.com",
      handle: "elliotwave",
    },
  ],
  tracks: mockTracks,
};

// Helper to format seconds as m:ss
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Helper to format large play counts
export function formatPlays(plays: number): string {
  if (plays >= 1000) {
    return `${(plays / 1000).toFixed(1)}k`;
  }
  return plays.toString();
}
