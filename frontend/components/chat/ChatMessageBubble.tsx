"use client";

import Markdown from "react-markdown";
import type { AnyMessage } from "@/types/chat";

type Props = {
    message: AnyMessage;
};

export default function ChatMessageBubble({ message }: Props) {
    const isUser = message.role === "user";
    const isPending = "isPending" in message && message.isPending;

    if (isUser) {
        return (
            <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl bg-gray-200 px-4 py-3 text-sm leading-relaxed text-gray-900">
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[85%]">
            {isPending && !message.content ? (
                <span className="flex gap-1 items-center h-5">
                    <span className="size-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                    <span className="size-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                    <span className="size-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                </span>
            ) : (
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
                    <Markdown>{message.content}</Markdown>
                </p>
            )}
        </div>
    );
}
