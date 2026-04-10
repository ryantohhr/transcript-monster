import type { LucideIcon } from "lucide-react";

export type Transcript = {
    id: number;
    videoId: string;
    videoUrl: string;
    videoTitle: string;
    channelName: string;
    thumbnailUrl: string | null;
    publishDate: string;
    createdAt: string;
    textChunks: string[];
    timestampChunks: string[];
};

export type Filetype = "txt";

export type TranscriptOptions = {
    [key: string]: boolean | Filetype;
    filetype: Filetype;
    showVideoId: boolean;
    showTitle: boolean;
    showChannelName: boolean;
    showPublishDate: boolean;
    showTimestamps: boolean;
};

export type FiletypeData = {
    type: Filetype;
    title: string;
    desc: string;
    icon: LucideIcon;
};
