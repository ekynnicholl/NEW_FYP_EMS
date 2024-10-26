"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import image_401 from "@/public/images/401.jpg";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { useSession } from "next-auth/react";

const UnauthorizedAccessPage = () => {
	const router = useRouter();
	const { data: session, status } = useSession();

	useEffect(() => {
		const auth = getAuth();
		onAuthStateChanged(auth, user => {
			if (user || session) {
				router.push("/dashboard");
			}
		});
	}, [router]);

	return (
		<div className="min-h-screen flex flex-col justify-center items-center text-center py-20 bg-white dark:bg-dark_mode_bg p-5 -mt-12 lg:-mt-5">
			<Image src={image_401.src} alt="" width={300} height={420} className="w-[300px] lg:w-[420px]" />
			<div className="max-w-[546px] mx-auto w-full mt-6">
				<p className="text-slate-800 mb-2 lg:mb-4 text-xl lg:text-3xl font-bold">UNAUTHORIZED ACCESS!</p>
				<div className="text-sm lg:text-base font-normal mb-6 lg:mb-8 text-slate-700">Cookies Required! Please proceed to login.</div>
			</div>
			<div className="rounded-lg px-[16px] py-[10px] lg:px-[18px] lg:py-[11px] bg-slate-800 text-slate-100 text-[12px] lg:text-[15px] hover:bg-slate-900 focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
				<Link href="/login">Login</Link>
			</div>
		</div>
	);
};

export default UnauthorizedAccessPage;
