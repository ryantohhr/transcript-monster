import type { Transcript } from "@/types/transcript";

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
