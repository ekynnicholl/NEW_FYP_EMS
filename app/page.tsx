"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Homepage() {
	const router = useRouter();

	useEffect(() => {
		const redirectHomepage = () => {
			router.push("/homepage");
		};

		redirectHomepage();
	})

	return (
		<div className="w-full">
		</div>
	);
}
