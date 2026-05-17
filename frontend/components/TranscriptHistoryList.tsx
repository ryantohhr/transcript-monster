"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import TranscriptHistoryItem from "./TranscriptHistoryItem";
import { getTranscriptHistory } from "@/lib/api";
import type { Transcript } from "@/types/transcript";

type TranscriptHistoryListProps = {
  onDeleted?: () => void;
};

export default function TranscriptHistoryList({
  onDeleted,
}: TranscriptHistoryListProps) {
  const [history, setHistory] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = () => {
    setIsLoading(true);
    getTranscriptHistory()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (onDeleted) loadHistory();
  }, [onDeleted]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No transcripts yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-w-2xl mx-auto py-4">
      {history.map((t) => (
        <TranscriptHistoryItem
          key={t.id}
          transcript={t}
          onDeleted={loadHistory}
        />
      ))}
    </div>
  );
}
