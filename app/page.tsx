"use client";

import LandingPage from "@/components/homepage/landing_page";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Homepage() {
	const router = useRouter();

	// useEffect(() => {
	// 	const redirectHomepage = () => {
	// 		router.push("/homepage");
	// 	};

	// 	redirectHomepage();
	// })

	return (
		<div>
			<LandingPage />
		</div>
	);
}
