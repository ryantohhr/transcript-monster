"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { getChatHistory, sendChatMessage } from "@/lib/api";
import type { AnyMessage, ChatMessage, PendingChatMessage } from "@/types/chat";
import ChatInput from "./ChatInput";
import ChatMessageBubble from "./ChatMessageBubble";

type Props = {
    sessionId: string;
};

export default function ChatContainer({ sessionId }: Props) {
    const [messages, setMessages] = useState<AnyMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    const bottomRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadHistory() {
            try {
                const history = await getChatHistory(sessionId);
                if (!cancelled) setMessages(history);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load conversation history.",
                    );
                }
            } finally {
                if (!cancelled) setIsLoadingHistory(false);
            }
        }

        loadHistory();
        return () => {
            cancelled = true;
        };
    }, [sessionId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        return () => {
            abortRef.current?.abort();
        };
    }, []);

    const handleSend = useCallback(
        (content: string) => {
            setError(null);

            const userMsg: ChatMessage = {
                id: crypto.randomUUID(),
                sessionId,
                role: "user",
                content,
                createdAt: new Date().toISOString(),
            };

            const pendingId = crypto.randomUUID();
            const pendingMsg: PendingChatMessage = {
                id: pendingId,
                role: "assistant",
                content: "",
                isPending: true,
            };

            setMessages((prev) => [...prev, userMsg, pendingMsg]);
            setIsStreaming(true);

            abortRef.current = sendChatMessage(sessionId, content, {
                onToken(token) {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === pendingId
                                ? { ...msg, content: msg.content + token }
                                : msg,
                        ),
                    );
                },
                onDone() {
                    setMessages((prev) =>
                        prev.map((msg) => {
                            if (msg.id !== pendingId) return msg;
                            const { isPending: _, ...rest } = msg as PendingChatMessage;
                            return {
                                ...rest,
                                sessionId,
                                createdAt: new Date().toISOString(),
                            } satisfies ChatMessage;
                        }),
                    );
                    setIsStreaming(false);
                },
                onError(message) {
                    setMessages((prev) => prev.filter((msg) => msg.id !== pendingId));
                    setError(message);
                    setIsStreaming(false);
                },
            });
        },
        [sessionId],
    );

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col flex-1 gap-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
                    {isLoadingHistory ? (
                        <div className="flex flex-col gap-4">
                            <SkeletonMessage align="right" />
                            <SkeletonMessage align="left" />
                            <SkeletonMessage align="right" />
                        </div>
                    ) : messages.length === 0 ? (
                        <EmptyState />
                    ) : (
                        messages.map((msg) => (
                            <ChatMessageBubble key={msg.id} message={msg} />
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>

                {error && (
                    <div className="flex gap-2 items-start text-sm border border-red-800 bg-red-50 text-red-800 rounded-md p-4 shrink-0">
                        <TriangleAlert size={18} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <ChatInput onSend={handleSend} isStreaming={isStreaming} />
            </div>
        </div>
    );
}


function EmptyState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground select-none">
            <p className="font-semibold text-base">Ask anything about the video</p>
            <p className="text-sm text-center max-w-xs">
                The assistant will answer based solely on the video transcript.
            </p>
        </div>
    );
}

function SkeletonMessage({ align }: { align: "left" | "right" }) {
    return (
        <div className={align === "right" ? "flex justify-end" : ""}>
            <div
                className={`h-8 rounded-2xl bg-gray-200 animate-pulse ${align === "right" ? "w-48" : "w-64"
                    }`}
            />
        </div>
    );
}
