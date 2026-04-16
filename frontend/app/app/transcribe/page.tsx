"use client";

import { useState } from "react";
import TranscribeForm from "@/components/TranscribeForm";
import TranscriptDownload from "@/components/TranscriptDownload";
import type { Transcript } from "@/types/transcript";

export default function Transcribe() {
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);

  return (
    <div>
      {showTranscript && transcript ? (
        <TranscriptDownload transcript={transcript} />
      ) : (
        <TranscribeForm
          transcript={transcript}
          setTranscript={setTranscript}
          setShowTranscript={setShowTranscript}
        />
      )}
    </div>
  );
}
