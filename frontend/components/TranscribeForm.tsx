"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    Captions,
    CircleCheck,
    LoaderCircle,
    ScrollText,
    TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Transcript } from "@/types/transcript";
import { createTranscript } from "@/lib/api";
import TranscriptPreview from "./TranscriptPreview";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "./ui/form";
import { Input } from "./ui/input";
import ChatButton from "./chat/ChatButton";

const formSchema = z.object({
    url: z
        .string({ required_error: "Please enter a URL!" })
        .regex(
            /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(v\/|u\/\w\/|embed\/|watch\?v=|&v=|\?v=)([^#&?]*).*/,
            "Invalid YouTube URL.\nPlease enter a URL like https://www.youtube.com/watch?v=... or https://youtu.be/...",
        ),
});

type TranscribeFormProps = {
    transcript: Transcript | null;
    setTranscript: React.Dispatch<React.SetStateAction<Transcript | null>>;
    setShowTranscript: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function TranscribeForm({
    transcript,
    setTranscript,
    setShowTranscript,
}: TranscribeFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { url: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setError(null);

        try {
            const result = await createTranscript(values.url);
            setTranscript(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch transcript");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex justify-center items-start">
            <Card className="w-2/5 mt-10">
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                name="url"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>YouTube Video URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="YouTube URL" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Eg.{" "}
                                            <span className="text-red-700">
                                                https://youtube.com/watch?v=...
                                            </span>{" "}
                                            or{" "}
                                            <span className="text-red-700">
                                                https://youtu.be/...
                                            </span>
                                        </FormDescription>
                                        {form.formState.errors.url && (
                                            <div className="whitespace-pre-line text-sm flex gap-2 justify-start items-start border-1 border-red-800 bg-red-50 text-red-800 rounded-md p-4">
                                                <TriangleAlert size={25} />{" "}
                                                {form.formState.errors.url.message}
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />
                            {error && (
                                <div className="text-sm flex gap-2 items-start border border-red-800 bg-red-50 text-red-800 rounded-md p-4">
                                    <TriangleAlert size={20} /> {error}
                                </div>
                            )}
                            {transcript ? (
                                <>
                                    <div className="flex w-full justify-center items-center text-green-600 font-semibold text-lg my-5 gap-1">
                                        Transcript Ready! <CircleCheck />
                                    </div>
                                    <TranscriptPreview transcript={transcript} />
                                    <Button
                                        type="button"
                                        onClick={() => setShowTranscript(true)}
                                        className="w-full h-12 text-md py-5 bg-green-600 hover:bg-green-700 cursor-pointer"
                                    >
                                        <Captions />
                                        Get Transcript
                                    </Button>
                                    <ChatButton transcript={transcript} />
                                </>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 text-md py-5 bg-red-600 hover:bg-red-700 cursor-pointer"
                                >
                                    {isLoading ? (
                                        <>
                                            <LoaderCircle className="animate-spin" /> Processing...
                                        </>
                                    ) : (
                                        <>
                                            <ScrollText />
                                            Transcribe
                                        </>
                                    )}
                                </Button>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
