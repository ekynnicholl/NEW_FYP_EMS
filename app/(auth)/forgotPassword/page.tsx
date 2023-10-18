"use client";

import React, { useState } from "react";
import Image from "next/image";
import login_bg from "@/public/images/event_manager.png";
import forgot_psw from "@/public/images/forgot_pass.png";
import { auth } from "../../../google_config";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
	const [errorMessageResetPassword, setErrorMessageResetPassword] = useState<
		string | null
	>(null);
	const [successMessageResetPassword, setSuccessMessageResetPassword] = useState<
		string | null
	>(null);

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
	  
		const emailVal = (e.target as HTMLFormElement).email.value;
		sendPasswordResetEmail(auth, emailVal)
		  .then(data => {
			setSuccessMessageResetPassword("A password reset link has been sent.");
		  })
		  .catch(err => {
			if (err.code === "auth/user-not-found") {
			  setErrorMessageResetPassword("No user found.");
			} else {
			  console.log("Sign-in error: ", err);
			}
		  });
	  };
	  

	return (
		<div className="min-h-screen bg-slate-200 text-gray-900 flex justify-center">
			<div className="max-w-screen-lg m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1 lg:flex-row">
				<div className="hidden lg:flex flex-1 bg-slate-100 text-center">
					<div
						className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat h-full"
						style={{
							backgroundImage: `url(${login_bg.src})`,
							minHeight: "100%",
							marginTop: "-3px",
						}}></div>
				</div>
				<div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 flex flex-col items-center justify-center">
					<div className="mt-12 flex flex-col items-center">
						<div className="w-full flex-1 mt-5 lg:mt-8">
							<Image
								src={forgot_psw}
								alt="logo"
								width={280}
								height={280}
								className="mb-[75px] -mt-[160px] lg:w-[300px] lg:h-[300px] ml-1"
							/>
							<h1 className="text-center text-[22px] lg:text-3xl font-extrabold -mt-24">
								Reset Password
							</h1>
							<p className="mt-4 text-center mb-5 text-xs lg:text-base">
								Enter your email to reset your password.
							</p>

							<form
								onSubmit={handleResetPassword}
								className="mx-auto max-w-xs">
								{/* Email Input */}
								<input
									className="w-full px-8 py-[15px] lg:py-4 pl-5 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white mt-1 text-sm lg:text-base"
									type="email"
									placeholder="Enter your email address"
									name="email"
									required
								/>

								<p className="text-red-500 text-left ml-2 mt-1 text-[0.65rem] lg:text-xs ">
									{errorMessageResetPassword}
								</p>
								<p className="text-green-500 text-left ml-2 mt-1 text-[0.65rem] lg:text-xs">
									{successMessageResetPassword}
								</p>

								{/* Reset Button */}
								<button
									type="submit"
									className="mt-8 tracking-wide font-semibold bg-slate-900 text-gray-100 w-full py-[15px] lg:py-4 rounded-lg hover:bg-slate-950 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
									<svg
										className="w-6 h-6 -ml-2"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"></svg>
									<span className="mr-4 text-base lg:text-lg">
										Reset
									</span>
								</button>
							</form>

							<p className="mt-3 text-center mr-1 text-[12px] lg:text-sm">
								Go to your account?
								<a href="/login" className="font-semibold text-slate-700 ml-1">
									Sign in
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
