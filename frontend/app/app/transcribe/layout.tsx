"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Plus, ScrollText } from "lucide-react";
import TranscribeDialog from "@/components/TranscribeDialog";
import { Button } from "@/components/ui/button";

export default function TranscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [dialogOpen, setDialogOpen] = useState(false);

  const isDetailPage = pathname.match(/^\/app\/transcribe\/[^/]+$/);

  return (
    <div className="w-full px-6 py-4">
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        {isDetailPage ? (
          <Button
            variant="ghost"
            onClick={() => router.push("/app/transcribe")}
            className="cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to History
          </Button>
        ) : (
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <ScrollText size={24} />
            Your Transcripts
          </h1>
        )}
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-red-600 hover:bg-red-700 cursor-pointer"
        >
          <Plus size={16} />
          New Transcript
        </Button>
      </div>
      {children}
      <TranscribeDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
