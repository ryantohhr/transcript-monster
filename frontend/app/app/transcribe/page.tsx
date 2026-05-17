"use client";

import { Suspense, useState } from "react";
import { LoaderCircle } from "lucide-react";
import TranscriptHistoryList from "@/components/TranscriptHistoryList";

export default function TranscribePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDeleted = () => setRefreshKey((k) => k + 1);

  return (
    <Suspense
        key={refreshKey}
        fallback={
          <div className="flex justify-center py-8">
            <LoaderCircle className="animate-spin" />
          </div>
        }
      >
        <TranscriptHistoryList onDeleted={handleDeleted} />
      </Suspense>
  );
}
