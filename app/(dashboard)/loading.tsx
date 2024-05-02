import Image from "next/image";
import loadingGIF from "@/public/loading_bird.gif";

export default function Loading() {
    return <div className="flex flex-col justify-center items-center h-screen bg-[#ffffff] z-[999]">
        <Image src={loadingGIF.src} alt="loading..." width={100} height={100} className="w-[100px] lg:w-[100px]" />
    </div>;
}
