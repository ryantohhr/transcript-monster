"use client";

import { useState } from "react";
import TranscribeForm from "@/components/TranscribeForm";
import TranscriptDownload from "@/components/TranscriptDownload";
import type { Transcript } from "@/types/transcript";

export default function Home() {
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  return showTranscript && transcript ? (
    <TranscriptDownload transcript={transcript} />
  ) : (
    <TranscribeForm
      transcript={transcript}
      setTranscript={setTranscript}
      setShowTranscript={setShowTranscript}
    />
  );
}
