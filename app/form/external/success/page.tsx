"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SuccessIMG from "@/public/images/success_image.jpg";
import Image from "next/image";
import Link from "next/link";
import Confetti from "react-confetti";

export default function SuccessPage() {
	const [windowSize, setWindowSize] = useState({
		width: 0,
		height: 0,
	});

	useEffect(() => {
		function handleResize() {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}

		window.addEventListener("resize", handleResize);
		handleResize();
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<>
			<div className="min-h-screen flex flex-col justify-center items-center">
				<Confetti width={windowSize.width} height={windowSize.height} />
				<Image src={SuccessIMG.src} alt="success" width={300} height={500} className="w-[300px] lg:w-[500px] mt-10" />
				<p className="text-center mt-5">
					<span className="font-bold text-[20px]">We have received your form successfully!</span> <br />
					<br /> You should receive an email with a confirmation.
					<br />
					Please ensure to check your spam/ junk folder as well.
					<br />
					<br />
					Contact/ email us at <span className="font-bold">827-823</span> OR <span className="font-bold">emat@gmail.com</span> if you have
					not received anything within the next hour.
				</p>
				<Button className="mt-5" asChild>
					<Link href="/form/external">Return</Link>
				</Button>
			</div>
		</>
	);
}
