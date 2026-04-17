import type { Transcript } from "@/types/transcript";
import type { ChatMessage, ChatSession, SseEvent } from "@/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ApiTranscript = {
    id: number;
    video_id: string;
    video_url: string;
    video_title: string;
    channel_name: string;
    thumbnail_url: string | null;
    publish_date: string;
    created_at: string;
    text_chunks: string[];
    timestamp_chunks: string[];
};

function transformTranscript(raw: ApiTranscript): Transcript {
    return {
        id: raw.id,
        videoId: raw.video_id,
        videoUrl: raw.video_url,
        videoTitle: raw.video_title,
        channelName: raw.channel_name,
        thumbnailUrl: raw.thumbnail_url,
        publishDate: raw.publish_date,
        createdAt: raw.created_at,
        textChunks: raw.text_chunks,
        timestampChunks: raw.timestamp_chunks,
    };
}

export async function createTranscript(videoUrl: string): Promise<Transcript> {
    const res = await fetch(`${API_URL}/transcript/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url: videoUrl }),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail ?? "Failed to create transcript");
    }

    const data = await res.json();
    return transformTranscript(data.transcript);
}

type ApiChatSession = {
    id: string;
    transcript_id: number;
    created_at: string;
};

type ApiChatMessage = {
    id: string;
    session_id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
};

function transformChatSession(raw: ApiChatSession): ChatSession {
    return {
        id: raw.id,
        transcriptId: raw.transcript_id,
        createdAt: raw.created_at,
    };
}

function transformChatMessage(raw: ApiChatMessage): ChatMessage {
    return {
        id: raw.id,
        sessionId: raw.session_id,
        role: raw.role,
        content: raw.content,
        createdAt: raw.created_at,
    };
}

export async function createChatSession(
    transcriptId: number,
): Promise<ChatSession> {
    const res = await fetch(`${API_URL}/chat/sessions/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript_id: transcriptId }),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail ?? "Failed to create chat session");
    }

    const data = await res.json();
    return transformChatSession(data.session);
}

export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const res = await fetch(`${API_URL}/chat/sessions/${sessionId}/messages`);

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail ?? "Failed to fetch chat history");
    }

    const data = await res.json();
    return (data.messages as ApiChatMessage[]).map(transformChatMessage);
}

export function sendChatMessage(
    sessionId: string,
    content: string,
    callbacks: {
        onToken: (token: string) => void;
        onDone: () => void;
        onError: (message: string) => void;
    },
): AbortController {
    const controller = new AbortController();

    (async () => {
        let res: Response;
        try {
            res = await fetch(
                `${API_URL}/chat/sessions/${sessionId}/messages`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content }),
                    signal: controller.signal,
                },
            );
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                callbacks.onError("Failed to connect to the server.");
            }
            return;
        }

        if (!res.ok) {
            const error = await res.json().catch(() => ({ detail: "Unknown error" }));
            callbacks.onError(error.detail ?? "Failed to send message");
            return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
            callbacks.onError("No response body.");
            return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    const raw = line.slice("data: ".length).trim();
                    if (!raw) continue;

                    let event: SseEvent;
                    try {
                        event = JSON.parse(raw) as SseEvent;
                    } catch {
                        continue;
                    }

                    if (event.type === "token") {
                        callbacks.onToken(event.content);
                        await new Promise((resolve) => setTimeout(resolve, 0));
                    } else if (event.type === "done") {
                        callbacks.onDone();
                        return;
                    } else if (event.type === "error") {
                        callbacks.onError(event.content || "An error occurred.");
                        return;
                    }
                }
            }
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                callbacks.onError("Lost connection to the server.");
            }
        } finally {
            reader.releaseLock();
        }
    })();

    return controller;
}
