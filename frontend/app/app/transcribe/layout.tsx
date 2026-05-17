"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import TranscribeDialog from "@/components/TranscribeDialog";
import { Button } from "@/components/ui/button";

export default function TranscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="w-full px-6 py-4">
      <div className="flex justify-end mb-4">
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
