export type ChatSession = {
    id: string;
    transcriptId: number;
    createdAt: string;
};

export type MessageRole = "user" | "assistant";

export type ChatMessage = {
    id: string;
    sessionId: string;
    role: MessageRole;
    content: string;
    createdAt: string;
};

export type PendingChatMessage = {
    id: string;
    role: MessageRole;
    content: string;
    isPending: true;
};

export type AnyMessage = ChatMessage | PendingChatMessage;

export function isPersistedMessage(msg: AnyMessage): msg is ChatMessage {
    return !("isPending" in msg);
}

export type SseEventType = "token" | "done" | "error";

export type SseEvent = {
    type: SseEventType;
    content: string;
};
