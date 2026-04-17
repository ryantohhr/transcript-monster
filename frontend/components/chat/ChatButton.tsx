import { Bot } from "lucide-react";
import { Button } from "../ui/button";
import { Transcript } from "@/types/transcript";
import { useRouter } from "next/navigation";

export default function ChatButton({ transcript }: { transcript: Transcript }) {
    const router = useRouter();

    return (
        <Button
            type="button"
            onClick={() =>
                router.push(`/app/chat?transcriptId=${transcript.id}`)
            }
            className="w-full h-12 text-md py-5 bg-red-600 hover:bg-red-700 cursor-pointer"
        >
            <Bot />
            Chat 
        </Button>
    )
}