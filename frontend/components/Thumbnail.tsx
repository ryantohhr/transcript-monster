import Image from "next/image";
import { cn } from "@/lib/utils";

type ThumbnailProps = {
    url: string;
    width?: number;
    height?: number;
    className?: string;
    alt: string;
};

export default function Thumbnail({
    url,
    width = 240,
    height = 120,
    className,
    alt,
}: ThumbnailProps) {
    return (
        <Image
            loading="lazy"
            src={url}
            width={width}
            height={height}
            className={cn("rounded-md", className)}
            alt={alt}
        />
    );
}
