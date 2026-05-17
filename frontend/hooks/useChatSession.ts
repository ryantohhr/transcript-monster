"use client";

import { useEffect, useState } from "react";
import { createChatSession, getChatSessionsHistory } from "@/lib/api";
import type { ChatSession } from "@/types/chat";

type UseChatSessionReturn = {
  session: ChatSession | null;
  isLoading: boolean;
  error: string | null;
};

export function useChatSession(transcriptId: string): UseChatSessionReturn {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initSession() {
      setIsLoading(true);
      setError(null);

      try {
        const sessions = await getChatSessionsHistory();
        const existingSession = sessions.find(
          (s) => s.transcriptId === transcriptId,
        );

        if (existingSession) {
          if (!cancelled) {
            setSession(existingSession);
          }
        } else {
          const newSession = await createChatSession(transcriptId);
          if (!cancelled) {
            setSession(newSession);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to initialize chat session",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    return () => {
      cancelled = true;
    };
  }, [transcriptId]);

  return { session, isLoading, error };
}
