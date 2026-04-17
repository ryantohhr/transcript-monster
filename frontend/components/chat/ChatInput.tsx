"use client";

import { ArrowUp, LoaderCircle } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

type Props = {
    onSend: (content: string) => void;
    isStreaming: boolean;
};

export default function ChatInput({ onSend, isStreaming }: Props) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const value = textareaRef.current?.value.trim();
        if (!value || isStreaming) return;
        onSend(value);
        if (textareaRef.current) textareaRef.current.value = "";
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="relative border border-gray-300 rounded-2xl bg-gray-50 focus-within:ring-1 focus-within:ring-ring focus-within:border-gray-400 shrink-0"
        >
            <textarea
                ref={textareaRef}
                rows={1}
                disabled={isStreaming}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about the video…"
                className={[
                    "w-full resize-none bg-transparent px-4 py-3 pr-14",
                    "text-sm placeholder:text-muted-foreground",
                    "focus-visible:outline-none",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "leading-relaxed",
                ].join(" ")}
            />
            <Button
                type="submit"
                disabled={isStreaming}
                size="icon"
                className="absolute right-2 bottom-2 size-8 rounded-lg bg-foreground hover:bg-foreground/80 cursor-pointer"
            >
                {isStreaming ? (
                    <LoaderCircle size={16} className="animate-spin text-background" />
                ) : (
                    <ArrowUp size={16} className="text-background" />
                )}
            </Button>
        </form>
    );
}
