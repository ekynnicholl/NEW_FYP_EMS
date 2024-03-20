"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import login_bg from "@/public/images/event_manager.png";
import swin_logo from "@/public/swinburne_logo.png"
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { auth, provider } from "../../../google_config";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import cookie from 'js-cookie';
import ReCAPTCHA from "react-google-recaptcha";
import toast from 'react-hot-toast';
import loadingGIF from "@/public/loading_bird.gif";

type Info = {
	id: string
	firebase_uid: string;
};

export default function Login() {
	const [showPassword, setShowPassword] = useState(false);
	const [captcha, setCaptcha] = useState<string | null>();
	const recaptchaRef = useRef<ReCAPTCHA>(null);
	const isCompact = typeof window !== 'undefined' && window.innerWidth <= 640;
	const [isLoading, setIsLoading] = useState(false);

	// Toggle Password Visibility
	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const router = useRouter();
	const [value, setValue] = useState<string | null>(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessageLogin, setErrorMessageLogin] = useState<string | null>(null);

	const supabase = createClientComponentClient();
	const [info, setInfo] = useState<Info>({} as Info);
	const [infos, setInfos] = useState<Info[]>([] as Info[]);

	// Fetch data from database
	useEffect(() => {
		const authToken = cookie.get('authToken');
		if (authToken) {
			router.push("/homepage");
		}

		const fetchInfos = async () => {
			const { data } = await supabase.from("login").select("id, firebase_uid");
			setInfos(data || []); // Ensure data is not null
			if (data && data.length > 0) {
				// Assuming you want to use the first item in the 'data' array
				setInfo(data[0]);
			}
		};
		fetchInfos();
	}, [supabase, router]);

	// Handle Google SignIn Button Click
	const handleGoogleSignIn = async (info: Info) => {
		try {
			const result = await signInWithPopup(auth, provider);
			const userId = result.user.uid; // Extract user ID
			const email_address = result.user.email!;

			setValue(email_address);
			localStorage.setItem("email", email_address);
			localStorage.setItem("userId", userId); // Save user ID to localStorage

			const { data, error } = await supabase
				.from('login')
				.select('firebase_uid, email_address')
				.eq('firebase_uid', userId);

			if (error) {
				console.error('Error fetching user data:', error.message);
				return;
			}

			if (data && data.length > 0) {
				const userInfo = data[0];
				const { firebase_uid, email_address: dbEmailAddress } = userInfo;

				if (firebase_uid === userId && dbEmailAddress === email_address) {
					// setIsLoading(true);
					// toast.success('You have logged in successfully.');
					router.push("/homepage");

					// Set the cookies
					cookie.set('authToken', userId);
				} else {
					setErrorMessageLogin("Unauthorized user.");
				}
			} else {
				setErrorMessageLogin("Unauthorized user.");
			}
		} catch (error) {
			console.log("Sign-in error: ", error);
		}
	};

	useEffect(() => {
		setValue(localStorage.getItem("email"));
	}, []); // take the value from localStorage

	// Handle Login Button Click
	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!captcha) {
			toast.error('Please verify you are not a robot... Are you... a... robot?!');
			return;
		}

		try {
			const { user } = await signInWithEmailAndPassword(auth, email, password);
			const userId = user.uid; // Extract user ID
			const email_address = user.email;
			const email_address_verified = user.emailVerified;
			console.log(user, "authData");
			localStorage.setItem("userId", userId); // Save user ID to localStorage

			const { data, error } = await supabase
				.from('login')
				.select('firebase_uid, email_address')
				.eq('firebase_uid', userId);

			if (error) {
				console.error('Error fetching user data:', error.message);
				return;
			}

			if (data && data.length > 0) {
				const userInfo = data[0];
				const { firebase_uid, email_address: dbEmailAddress } = userInfo;

				// Redirect to the dashboard or another page after successful login
				if (firebase_uid === userId && dbEmailAddress === email_address && email_address_verified == true) {
					setIsLoading(true);
					toast.success('You have logged in successfully.');
					router.push("/homepage");

					// Set the cookies
					cookie.set('authToken', userId);
				} else {
					setErrorMessageLogin("Unauthorized user.");
				}
			} else {
				setErrorMessageLogin("Unauthorized user.");
			}
		} catch (error) {
			if (
				(error as any).code === "auth/user-not-found" ||
				(error as any).code === "auth/wrong-password"
			) {
				setErrorMessageLogin("Invalid email or password. Please try again.");
			} else {
				console.error("Login error: ", error);
			}
		}

		setCaptcha(null);
		if (recaptchaRef.current) {
			recaptchaRef.current.reset();
		}
	};

	return (
		<>
			{isLoading ? (
				<div className="flex flex-col justify-center items-center h-screen bg-[#ffffff] z-[999]">
					<img src={loadingGIF.src} alt="" className="w-[100px] lg:w-[100px]" />
				</div>
			) : (
				<div>
					<div className="min-h-screen bg-slate-200 text-gray-900 flex justify-center dark:bg-[#242729]">
						<div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1 lg:flex-row dark:bg-[#1E2021]">
							<div className="hidden lg:flex flex-1 bg-slate-100 text-center dark:bg-[#1E2021]">
								<div
									className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat h-full"
									style={{
										backgroundImage: `url(${login_bg.src})`,
										minHeight: "100%",
										marginTop: "-3px",
									}}></div>
							</div>

							<div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 flex flex-col justify-center -mt-[80px] lg:-mt-4 dark:bg-dark_mode_card">
								<Image src={swin_logo} alt="logo" width={260} height={280} className="mb-5 lg:w-[315px] mx-auto" />
								<h1 className="text-2xl lg:text-3xl font-extrabold mb-6 lg:mb-8 text-center text-slate-800 dark:text-[#D6D2CD]">
									Sign In
								</h1>

								<div className="w-full">
									<form onSubmit={handleLogin} className="max-w-xs mx-auto">

										{/* Email Input*/}
										<input
											className="w-full px-8 py-[15px] lg:py-4 pl-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm lg:text-base focus:outline-none focus:border-gray-400 focus:bg-white mb-[20px] mt-1 dark:bg-[#1D2021] dark:border-[#363B3D] placeholder:[#5C5A53] dark:text-slate-300 dark:focus:bg-[#1D2021]"
											type="email"
											placeholder="Email address"
											name="email"
											value={email}
											onChange={e => setEmail(e.target.value)}
											required
										/>
										<p className="text-red-500 text-left ml-3 lg:ml-2 text-[0.65rem] lg:text-xs -mt-4 lg:-mt-[17px] dark:text-red-600">
											{errorMessageLogin}
										</p>

										{/* Password Input*/}
										<div className="relative">
											<input
												className="w-full px-8 py-[15px] lg:py-4 pl-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm lg:text-base focus:outline-none focus:border-gray-400 focus:bg-white mb-[10px] lg:mb-4 mt-6 dark:bg-[#1D2021] dark:border-[#363B3D] placeholder:[#5C5A53] dark:text-slate-300 dark:focus:bg-[#1D2021]"
												type={showPassword ? "text" : "password"}
												placeholder="Password"
												id="password"
												name="password"
												autoComplete="off"
												value={password}
												onChange={e => setPassword(e.target.value)}
												required
											/>
											<button
												className="btn btn-outline-secondary absolute top-11 right-0 -mt-1 mr-4"
												type="button"
												id="password-toggle"
												onClick={togglePasswordVisibility}>
												{showPassword ? (
													<FaEyeSlash className="text-lg lg:text-xl lg:mt-[2.5px] dark:text-[#D6D2CD]" />
												) : (
													<FaEye className="text-lg lg:text-xl lg:mt-[2.5px] dark:text-[#D6D2CD]" />
												)}
											</button>
										</div>

										{/* Forgot Password*/}
										<div className="-mt-[10px] lg:-mt-3 mr-1">
											<p className="text-right">
												<a
													href="/forgotPassword"
													className="text-xs lg:text-sm text-slate-700 font-semibold dark:text-dark_text2">
													Forgot Password?
												</a>
											</p>
										</div>

										<div className="mt-3">
											<ReCAPTCHA
												ref={recaptchaRef}
												sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
												onChange={setCaptcha}
												size={isCompact ? "compact" : "normal"}
											/>
										</div>

										{/* Submit Button */}
										<button
											type="submit"
											className="mt-3 lg:mt-5 tracking-wide font-semibold bg-slate-900 text-gray-100 w-full py-[15px] lg:py-4 rounded-lg hover:bg-slate-950 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:bg-slate-800">
											<svg
												className="w-6 h-6 -ml-2"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round">
												{/* Submit SVG Path */}
											</svg>
											<span className="mr-4 text-base lg:text-lg text-slate-200 dark:-mt-[3px]">Login</span>
										</button>
									</form>
								</div>
							</div>
						</div>
					</div>
					<footer className="text-white bg-black-500 text-center py-[1px]">
						<p className="text-sm">
							© 2024 Event Management and Attendance Tracking System. All rights reserved.
						</p>
						{/* <p className="text-xs">
					Owned by Academic Administration Office, Swinburne University of Technology Sarawak.
				</p> */}
					</footer>
				</div>
			)}
		</>
	);
}
