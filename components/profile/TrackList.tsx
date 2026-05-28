"use client";

import { Track } from "@/types";
import { Play } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TrackList({ tracks }: { tracks: Track[] }) {
  return (
    <>
      {tracks.map((track: Track) => {
        return (
          <Card key={track.id} className="flex items-center gap-2 w-full">
            <Play size={32} />
            <CardTitle>{track.title}</CardTitle>
            <CardContent>
              {/* <img src={track.coverUrl} alt="Track Cover Image" /> */}
            </CardContent>
            <CardFooter className="gap-2 w-full justify-between">
              <Badge>{track.genre}</Badge>
              {/* <p>{track.plays}</p> */}
              <p>{track.createdAt}</p>
            </CardFooter>
          </Card>
        );
      })}
    </>
  );
}
