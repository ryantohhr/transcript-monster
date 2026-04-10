"use client";

import { useState } from "react";
import { formatTranscript } from "@/lib/utils";
import type { Transcript, TranscriptOptions } from "@/types/transcript";
import DownloadFilePreview from "./DownloadFilePreview";
import FileOptionsControl from "./FileOptionsControl";
import TranscriptPreview from "./TranscriptPreview";
import { Card } from "./ui/card";

const defaultTranscriptOptions: TranscriptOptions = {
    filetype: "txt",
    showVideoId: true,
    showTitle: true,
    showChannelName: true,
    showPublishDate: true,
    showTimestamps: true,
};

export default function TranscriptDownload({
    transcript,
}: {
    transcript: Transcript;
}) {
    const [previewOptions, setPreviewOptions] = useState<TranscriptOptions>(
        defaultTranscriptOptions,
    );
    const transcriptText = formatTranscript(transcript, previewOptions);

    return (
        <div className="grid grid-cols-2 gap-10 p-10">
            <Card className="p-10">
                <TranscriptPreview transcript={transcript} />
                <DownloadFilePreview transcriptText={transcriptText} />
            </Card>
            <div>
                <FileOptionsControl
                    transcript={transcript}
                    previewOptions={previewOptions}
                    setPreviewOptions={setPreviewOptions}
                />
            </div>
        </div>
    );
}
