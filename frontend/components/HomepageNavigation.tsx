import { ScrollText } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

export default function HomepageNavigation() {
  return (
    <div className="w-full px-15 py-10">
      <Card className="w-[25rem]">
        <CardHeader>
          <CardTitle className="flex items-center gap-1">
            <ScrollText size={18} />
            Transcribe
          </CardTitle>
          <CardDescription>
            Get the transcript of a YouTube video.
          </CardDescription>
        </CardHeader>
        <Button asChild className="mx-5 bg-red-500 hover:bg-red-700">
          <a href="/app/transcribe">Get Transcripts</a>
        </Button>
      </Card>
    </div>
  );
}
