import loadingGIF from "@/public/loading_bird.gif";

export default function Loading() {
	return <div className="flex flex-col justify-center items-center h-screen bg-[#ffffff] z-[999]">
		<img src={loadingGIF.src} alt="" className="w-[100px] lg:w-[100px]" />
	</div>;
}
