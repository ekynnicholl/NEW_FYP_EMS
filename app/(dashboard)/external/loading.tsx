import loadingGIF from "@/public/loading_bird.gif";
import Image from "next/image";

export default function Loading() {
	return <div className="flex flex-col justify-center items-center h-screen bg-[#ffffff] z-[999]">
		<Image width={100} height={100} src={loadingGIF.src} alt="" className="w-[100px] lg:w-[100px]" />
	</div>;
}
