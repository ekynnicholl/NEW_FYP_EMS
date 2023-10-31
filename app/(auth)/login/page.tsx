"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import login_bg from "@/public/images/event_manager.png";
import swin_logo from "@/public/swinburne_logo.png"
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { auth, provider } from "../../../google_config";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import cookie from 'js-cookie';
// npm install js-cookie
// npm install --save-dev @types/js-cookie

type Info = {
	id: string
	firebase_uid: string;
};

export default function Login() {
	const [showPassword, setShowPassword] = useState(false);

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
					console.log("Success!!!");
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

		try {
			const { user } = await signInWithEmailAndPassword(auth, email, password);
			const userId = user.uid; // Extract user ID
			const email_address = user.email;
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
				if (firebase_uid === userId && dbEmailAddress === email_address) {
					console.log("Success!!!");
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
	};

	return (
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
					<Image src={swin_logo} alt="logo" width={260} height={280} className="mb-5 lg:w-[280px] mx-auto lg:hidden" />
					<h1 className="text-2xl lg:text-3xl font-extrabold mb-6 lg:mb-8 text-center text-slate-800 dark:text-[#D6D2CD]">
						Sign In
					</h1>

					{/* Sign in With Google */}
					<button
						onClick={() => handleGoogleSignIn(info)}
						className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-slate-200 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline mx-auto dark:bg-[#242729]">
						<div className="bg-white py-2 px-[6px] lg:px-2 rounded-full dark:bg-dark_mode_card">
							<svg className="w-4" viewBox="0 0 533.5 544.3">
								{/* Google SVG Paths */}
								<path
									d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"
									fill="#4285f4"
								/>
								<path
									d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"
									fill="#34a853"
								/>
								<path
									d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"
									fill="#fbbc04"
								/>
								<path
									d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"
									fill="#ea4335"
								/>
							</svg>
						</div>
						<span className="ml-4 text-sm lg:text-base text-slate-800 dark:text-[#C5C5C1] -mt-[2px]">
							Sign In with Google
						</span>
					</button>

					<div className="my-5 border-b border-gray-300 lg:mb-8 text-center">
						<div className="leading-none px-2 inline-block text-xs lg:text-sm text-gray-500 tracking-wide font-medium bg-white transform translate-y-1/2 dark:text-slate-400 dark:bg-dark_mode_card">
							Or login with e-mail
						</div>
					</div>

					<div className="w-full">
						<form onSubmit={handleLogin} className="max-w-xs mx-auto">

							{/* Email Input*/}
							<input
								className="w-full px-8 py-[15px] lg:py-4 pl-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm lg:text-base focus:outline-none focus:border-gray-400 focus:bg-white mb-[20px] mt-1 dark:bg-[#1D2021] dark:border-[#363B3D] placeholder:[#5C5A53] dark:text-slate-300"
								type="email"
								placeholder="Email address"
								name="email"
								value={email}
								onChange={e => setEmail(e.target.value)}
								required
							/>
							<p className="text-red-500 text-left ml-3 text-[0.65rem] lg:text-xs -mt-4">
								{errorMessageLogin}
							</p>

							{/* Password Input*/}
							<div className="relative">
								<input
									className="w-full px-8 py-[15px] lg:py-4 pl-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm lg:text-base focus:outline-none focus:border-gray-400 focus:bg-white mb-[10px] lg:mb-4 mt-6 dark:bg-[#1D2021] dark:border-[#363B3D] placeholder:[#5C5A53] dark:text-slate-300"
									type={showPassword ? "password" : "text"}
									placeholder="Password"
									id="password"
									name="password"
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
										Forgot password
									</a>
								</p>
							</div>

							{/* Submit Button */}
							<button
								type="submit"
								className="mt-6 lg:mt-8 tracking-wide font-semibold bg-slate-900 text-gray-100 w-full py-[15px] lg:py-4 rounded-lg hover:bg-slate-950 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:bg-slate-800">
								<svg
									className="w-6 h-6 -ml-2"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round">
									{/* Submit SVG Path */}
								</svg>
								<span className="mr-4 text-base lg:text-lg dark:-mt-[3px]">Login</span>
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
