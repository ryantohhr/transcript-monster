"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TranscriptDownload from "@/components/TranscriptDownload";
import ChatContainer from "@/components/chat/ChatContainer";
import { Button } from "@/components/ui/button";
import { getTranscript } from "@/lib/api";
import { useChatSession } from "@/hooks/useChatSession";
import type { Transcript } from "@/types/transcript";

export default function TranscriptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const transcriptId = params.transcriptId as string;

  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { session: chatSession, isLoading: isLoadingSession } =
    useChatSession(transcriptId);

  useEffect(() => {
    let cancelled = false;

    getTranscript(transcriptId)
      .then((t) => {
        if (!cancelled) {
          setTranscript(t);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch transcript",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [transcriptId]);

  if (isLoading || isLoadingSession) {
    return (
      <div className="flex justify-center py-8">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  if (error || !transcript) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error || "Transcript not found"}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/app/transcribe")}
          className="mt-4 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to History
        </Button>
      </div>
    );
  }

  return (
    <Tabs defaultValue="download" className="w-full">
      <TabsList>
        <TabsTrigger value="download">Download</TabsTrigger>
        <TabsTrigger value="chat">Chat</TabsTrigger>
      </TabsList>
      <TabsContent value="download">
        <TranscriptDownload transcript={transcript} />
      </TabsContent>
      <TabsContent value="chat">
        {chatSession ? (
          <div className="h-[calc(100vh-16rem)]">
            <ChatContainer sessionId={chatSession.id} />
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <LoaderCircle className="animate-spin" />
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
