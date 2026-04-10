"use client";

import { Download, FileText } from "lucide-react";
import { useState } from "react";
import type {
    Filetype,
    FiletypeData,
    Transcript,
    TranscriptOptions,
} from "@/types/transcript";
import { formatTranscript } from "@/lib/utils";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { Card, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

const filetypes: FiletypeData[] = [
    {
        type: "txt",
        title: "Text (.txt)",
        desc: "Plain text format.",
        icon: FileText,
    },
];

type CheckboxField = {
    optionField:
    | "showVideoId"
    | "showTitle"
    | "showPublishDate"
    | "showChannelName"
    | "showTimestamps";
    optionLabel: string;
};

const checkboxFields: CheckboxField[] = [
    { optionField: "showVideoId", optionLabel: "Video ID" },
    { optionField: "showTitle", optionLabel: "Title" },
    { optionField: "showPublishDate", optionLabel: "Publish Date" },
    { optionField: "showChannelName", optionLabel: "Channel Name" },
    { optionField: "showTimestamps", optionLabel: "Timestamps" },
];

type FileOptionsControlProps = {
    transcript: Transcript;
    previewOptions: TranscriptOptions;
    setPreviewOptions: React.Dispatch<React.SetStateAction<TranscriptOptions>>;
};

export default function FileOptionsControl({
    transcript,
    previewOptions,
    setPreviewOptions,
}: FileOptionsControlProps) {
    const [currentFiletype, setCurrentFiletype] = useState<Filetype>(
        previewOptions.filetype,
    );

    function handleDownload() {
        const fileContent = formatTranscript(transcript, previewOptions);
        const fileName = `${transcript.videoTitle.toLowerCase().split(" ").join("_")}.${previewOptions.filetype}`;
        const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <Card className="w-[30rem] mx-auto p-5 gap-2">
            <CardTitle>Download Options</CardTitle>
            <hr className="mb-3" />
            <div className="border-2 border-gray-300 rounded-md w-full bg-gray-50 px-5 py-3">
                <h1 className="font-semibold">File Format</h1>
                <hr />
                <div className="grid grid-cols-2 w-full pt-4 gap-2">
                    {filetypes.map((filetype) => (
                        <div
                            key={filetype.type}
                            onClick={() => {
                                setCurrentFiletype(filetype.type);
                                setPreviewOptions({
                                    ...previewOptions,
                                    filetype: filetype.type,
                                });
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setCurrentFiletype(filetype.type);
                                    setPreviewOptions({
                                        ...previewOptions,
                                        filetype: filetype.type,
                                    });
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            className={`cursor-pointer flex gap-2 border-1 rounded-md p-3 ${currentFiletype === filetype.type ? "border-gray-500 bg-gray-200" : "border-gray-300 bg-gray-100"}`}
                        >
                            <filetype.icon size={20} />
                            <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-sm">{filetype.title}</span>
                                <span className="text-sm text-gray-700">{filetype.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Accordion type="single" collapsible>
                <AccordionItem
                    value="content-options"
                    className="bg-gray-50 border-2 last:border-b-2 border-gray-300 rounded-md px-4"
                >
                    <AccordionTrigger className="cursor-pointer">
                        Content Options
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="grid grid-cols-2 px-1">
                            {checkboxFields.map((field) => (
                                <div
                                    className="flex items-center gap-1 hover:bg-gray-100 cursor-pointer rounded-sm p-1"
                                    onClickCapture={() =>
                                        setPreviewOptions({
                                            ...previewOptions,
                                            [field.optionField]: !previewOptions[field.optionField],
                                        })
                                    }
                                    key={field.optionField}
                                >
                                    <Checkbox
                                        checked={!!previewOptions[field.optionField]}
                                        onCheckedChange={() =>
                                            setPreviewOptions({
                                                ...previewOptions,
                                                [field.optionField]: !previewOptions[field.optionField],
                                            })
                                        }
                                        id={field.optionField}
                                        className="cursor-pointer data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                                    />
                                    <Label htmlFor={field.optionField} className="cursor-pointer">
                                        {field.optionLabel}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <Button
                onClick={handleDownload}
                className="py-5 cursor-pointer text-green-700 bg-green-100 hover:bg-green-200 border-1 border-green-500"
            >
                <Download />
                Download Transcript
            </Button>
        </Card>
    );
}
