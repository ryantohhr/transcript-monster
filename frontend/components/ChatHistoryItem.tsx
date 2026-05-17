"use client";

import { CalendarDays, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ChatSession } from "@/types/chat";
import { deleteChatSession } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

type ChatHistoryItemProps = {
  session: ChatSession;
  transcriptTitle?: string;
  onDeleted?: () => void;
};

export default function ChatHistoryItem({
  session,
  transcriptTitle,
  onDeleted,
}: ChatHistoryItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteChatSession(session.id);
      onDeleted?.();
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-4 hover:bg-gray-50 transition-colors">
      <Link href={`/app/chat?sessionId=${session.id}`} className="block">
        <div className="flex flex-col gap-1">
          {transcriptTitle && (
            <h3 className="font-semibold text-sm truncate">
              {transcriptTitle}
            </h3>
          )}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <CalendarDays size={12} /> {formatDate(session.createdAt)}
          </span>
        </div>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="mt-2 text-red-600 hover:text-red-700"
      >
        <Trash2 size={14} /> Delete
      </Button>
    </Card>
  );
}
