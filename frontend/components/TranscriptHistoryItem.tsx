"use client";

import { CalendarDays, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Transcript } from "@/types/transcript";
import { deleteTranscript } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import Thumbnail from "./Thumbnail";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

type TranscriptHistoryItemProps = {
  transcript: Transcript;
  onDeleted?: () => void;
};

export default function TranscriptHistoryItem({
  transcript,
  onDeleted,
}: TranscriptHistoryItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTranscript(transcript.id);
      onDeleted?.();
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-4 hover:bg-gray-50 transition-colors">
      <Link
        href={`/app/transcribe?transcriptId=${transcript.id}`}
        className="flex gap-3"
      >
        {transcript.thumbnailUrl && (
          <Thumbnail
            url={transcript.thumbnailUrl}
            alt={transcript.videoTitle}
            className="w-24 h-16 object-cover rounded"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">
            {transcript.videoTitle}
          </h3>
          <div className="flex gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <User size={12} /> {transcript.channelName}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays size={12} /> {formatDate(transcript.publishDate)}
            </span>
          </div>
        </div>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="mt-2 text-red-600 hover:text-red-700"
      >
        <Trash2 size={14} /> Delete
      </Button>
    </Card>
  );
}
