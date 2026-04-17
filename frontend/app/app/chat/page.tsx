"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    Bot,
    CircleCheck,
    LoaderCircle,
    ScrollText,
    TriangleAlert,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ChatContainer from "@/components/chat/ChatContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createChatSession, createTranscript } from "@/lib/api";

const formSchema = z.object({
    url: z
        .string({ required_error: "Please enter a URL!" })
        .regex(
            /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(v\/|u\/\w\/|embed\/|watch\?v=|&v=|\?v=)([^#&?]*).*/,
            "Invalid YouTube URL.\nPlease enter a URL like https://www.youtube.com/watch?v=... or https://youtu.be/...",
        ),
});

function ChatPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isInitialising, setIsInitialising] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);
    const [transcriptReady, setTranscriptReady] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { url: "" },
    });

    useEffect(() => {
        const rawId = searchParams.get("transcriptId");
        if (!rawId) return;

        const transcriptId = parseInt(rawId, 10);
        if (isNaN(transcriptId)) return;

        setIsInitialising(true);
        setInitError(null);

        createChatSession(transcriptId)
            .then((session) => {
                setSessionId(session.id);
                router.replace("/app/chat");
            })
            .catch((err) => {
                setInitError(
                    err instanceof Error ? err.message : "Failed to start chat session.",
                );
            })
            .finally(() => setIsInitialising(false));
    }, [searchParams]);
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsInitialising(true);
        setInitError(null);
        setTranscriptReady(false);

        try {
            const transcript = await createTranscript(values.url);
            setTranscriptReady(true);
            const session = await createChatSession(transcript.id);
            setSessionId(session.id);
        } catch (err) {
            setInitError(
                err instanceof Error ? err.message : "Failed to start chat.",
            );
        } finally {
            setIsInitialising(false);
        }
    }

    if (sessionId) {
        return (
            <div className="flex flex-col h-[calc(100vh-4rem)] p-6 gap-0">
                <ChatContainer sessionId={sessionId} />
            </div>
        );
    }

    return (
        <div className="flex justify-center items-start">
            <Card className="w-2/5 mt-10">
                <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                        <Bot size={20} className="text-red-600" />
                        <h1 className="font-semibold text-base">Chat about a YouTube video</h1>
                    </div>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                name="url"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>YouTube Video URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="YouTube URL"
                                                disabled={isInitialising}
                                                {...field}
                                            />
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
                                                <TriangleAlert size={25} />
                                                {form.formState.errors.url.message}
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />

                            {initError && (
                                <div className="text-sm flex gap-2 items-start border border-red-800 bg-red-50 text-red-800 rounded-md p-4">
                                    <TriangleAlert size={20} className="shrink-0" />
                                    {initError}
                                </div>
                            )}

                            {/* Progress feedback during initialisation */}
                            {isInitialising && (
                                <div className="text-sm flex gap-2 items-center text-muted-foreground">
                                    {transcriptReady ? (
                                        <>
                                            <CircleCheck size={16} className="text-green-600" />
                                            Transcript ready — starting chat…
                                        </>
                                    ) : (
                                        <>
                                            <LoaderCircle size={16} className="animate-spin" />
                                            Fetching transcript…
                                        </>
                                    )}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isInitialising}
                                className="w-full h-12 text-md py-5 bg-red-600 hover:bg-red-700 cursor-pointer"
                            >
                                {isInitialising ? (
                                    <>
                                        <LoaderCircle className="animate-spin" />
                                        Processing…
                                    </>
                                ) : (
                                    <>
                                        <ScrollText />
                                        Start Chat
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center items-start">
                    <Card className="w-2/5 mt-10">
                        <CardContent>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <LoaderCircle size={16} className="animate-spin" />
                                Loading…
                            </div>
                        </CardContent>
                    </Card>
                </div>
            }
        >
            <ChatPageInner />
        </Suspense>
    );
}
