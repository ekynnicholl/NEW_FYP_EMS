"use client";

import { IoMdArrowDroprightCircle, IoMdArrowDropleftCircle } from "react-icons/io";
import React, { useState } from "react";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { auth, provider } from "../../google_config";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import cookie from "js-cookie";

const CreateAdminAccount = () => {
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleExpansion = () => {
		setIsExpanded(!isExpanded);
	};

	const [showModalAddAdmin, setShowModalAddAdmin] = useState(false);

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [value, setValue] = useState<string | null>(null);
	const [errorMessageEmailAddress, setErrorMessageEmailAddress] = useState<string | null>(null);
	const [errorMessagePassword, setErrorMessagePassword] = useState<string | null>(null);
	const [errorMessageConfirmPassword, setErrorMessageConfirmPassword] = useState<string | null>(null);
	const [successMessageEmailVerification, setSuccessMessageEmailVerification] = useState<string | null>(null);

	const supabase = createClientComponentClient();

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const toggleConfirmPasswordVisibility = () => {
		setShowConfirmPassword(!showConfirmPassword);
	};

	const handleCreateAccount = async (e: React.FormEvent) => {
		e.preventDefault();
		const email = (e.target as HTMLFormElement).email.value;
		const password = (e.target as HTMLFormElement).password.value;
		const confirmPassword = (e.target as HTMLFormElement).confirmPassword.value;

		if (password.length >= 6) {
			setErrorMessagePassword(null); // Clear password error message if length is >= 6
		}

		if (password === confirmPassword) {
			try {
				const userCredential = await createUserWithEmailAndPassword(auth, email, password);
				const user = userCredential.user;
				const email_address = user.email;

				await sendEmailVerification(user);
				setErrorMessageConfirmPassword(null);
				console.log("Email verification sent!");
				setSuccessMessageEmailVerification("Email verification sent. Please check your inbox.");

				// Retrieve firebase_uid from Firebase Authentication
				const userId = user.uid;

				// Check if the user with this firebase_uid already exists in Supabase
				const { data, error } = await supabase
					.from("login")
					.select("firebase_uid, email_address")
					.eq("firebase_uid", userId);

				if (error) {
					console.error("Error fetching user data:", error.message);
					return;
				}

				if (data && data.length > 0) {
					// User with this firebase_uid already exists, handle it accordingly
					console.log("User with this firebase_uid already exists:", data);
				} else {
					// User with this firebase_uid does not exist, proceed with inserting it
					const { data, error } = await supabase.from("login").upsert([{ firebase_uid: userId, email_address: email }]);

					if (error) {
						console.error("Error inserting data into Supabase:", error.message);
					}
				}
			} catch (error) {
				const firebaseError = error as any;

				// Handle Firebase authentication errors
				if (firebaseError.code === "auth/email-already-in-use") {
					setErrorMessageEmailAddress("Email is already in use.");
					setErrorMessagePassword(null);
					setErrorMessageConfirmPassword(null);
				} else if (firebaseError.code === "auth/weak-password") {
					setErrorMessagePassword("Password must be at least 6 characters.");
				} else if (firebaseError.code === "auth/invalid-email") {
					setErrorMessageEmailAddress("Invalid email address.");
				} else {
					console.error("Sign-up error: ", error);
				}
			}
		} else {
			setErrorMessageConfirmPassword("Passwords do not match.");
		}
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const password = e.target.value;

		if (password.length >= 6) {
			setErrorMessagePassword(null); // Clear password error message if length is >= 6
		}
	};

	const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const confirmPassword = e.target.value;
		const passwordElement = document.getElementById("password");

		if (passwordElement && passwordElement instanceof HTMLInputElement) {
			const password = passwordElement.value;

			if (password === confirmPassword) {
				setErrorMessageConfirmPassword(null);
			} else {
				setErrorMessageConfirmPassword("Passwords do not match.");
			}
		}
	};

	return (
		<div
			className={`pl-5 pr-5 pt-4 pb-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card text-left transition-max-w duration-300 ease-in-out ${
				isExpanded ? "lg:max-w-[30%]" : "max-w-[400px]"
			}`}
		>
			<div className="flex items-center">
				<h1 className="font-bold text-[18px] lg:text-[20px] dark:text-dark_text">Administrator Account Registration</h1>
				<div onClick={toggleExpansion} className="ml-auto cursor-pointer">
					{isExpanded ? (
						<IoMdArrowDropleftCircle className="text-[30px] dark:text-dark_text" />
					) : (
						<IoMdArrowDroprightCircle className="text-[30px] dark:text-dark_text" />
					)}
				</div>
			</div>
			<div className="border-t border-gray-300 my-2"></div>
			{isExpanded ? (
				<div className="overflow-y-auto max-h-80">
					<form onSubmit={e => handleCreateAccount(e)}>
						<div className="mb-[0px] lg:mb-[20px] mt-[30px] dark:bg-dark_mode_card">
							<div className="mx-auto max-w-xs ">
								<p className="text-xl lg:text-2xl font-medium mb-6 text-center text-slate-800 dark:text-[#E8E6E3]">Create an Account</p>
								<input
									className="w-full py-3 lg:py-4 pl-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-xs lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white dark:bg-[#1D2021] dark:border-[#363B3D] placeholder:[#5C5A53] dark:text-slate-300 dark:focus:bg-[#1D2021]" 
									type="email"
									placeholder="Email address"
									name="email"
									required
								/>
								<p className="text-red-500 text-left ml-[6px] mt-0 text-xs">{errorMessageEmailAddress}</p>

								<div className="relative">
									<input
										className="w-full py-3 lg:py-4 pl-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-xs lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-4 lg:mt-5 dark:bg-[#1D2021] dark:border-[#363B3D] placeholder:[#5C5A53] dark:text-slate-300 dark:focus:bg-[#1D2021]"
										type={showPassword ? "password" : "text"}
										placeholder="Password"
										id="password"
										name="password"
										required
										onChange={handlePasswordChange}
									/>
									<button
										className="btn btn-outline-secondary absolute top-4 right-0 mt-5 mr-4"
										type="button"
										id="password-toggle"
										onClick={togglePasswordVisibility}
									>
										{showPassword ? (
											<FaEyeSlash className="text-lg lg:text-xl lg:mt-[2.5px] dark:text-[#D6D2CD]" />
										) : (
											<FaEye className="text-lg lg:text-xl lg:mt-[2.5px] dark:text-[#D6D2CD]" />
										)}
									</button>

									<p className="text-red-500 text-left ml-2 mt-1 text-sm">{errorMessagePassword}</p>
								</div>
								<div className="relative">
									<input
										className="w-full py-3 lg:py-4 pl-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-xs lg:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-4 lg:mt-5 dark:bg-[#1D2021] dark:border-[#363B3D] placeholder:[#5C5A53] dark:text-slate-300 dark:focus:bg-[#1D2021]"
										type={showConfirmPassword ? "password" : "text"}
										placeholder="Confirm password"
										id="confirmPassword"
										onChange={handleConfirmPasswordChange}
										required
									/>

									<button
										className="btn btn-outline-secondary absolute top-4 right-0 mt-[18px] mr-4"
										type="button"
										id="confirm-password-toggle"
										onClick={toggleConfirmPasswordVisibility}
									>
										{showConfirmPassword ? (
											<FaEyeSlash className="text-lg lg:text-xl lg:mt-[2.5px] dark:text-[#D6D2CD]" />
										) : (
											<FaEye className="text-lg lg:text-xl lg:mt-[2.5px] dark:text-[#D6D2CD]" />
										)}
									</button>

									<p className="text-red-500 text-left ml-[6px] mt-1 text-xs">{errorMessageConfirmPassword}</p>
									<p className="text-green-500 text-left ml-[6px] mt-1 text-xs">{successMessageEmailVerification}</p>
								</div>
								<button className="mt-6 lg:mt-10 tracking-wide font-semibold bg-slate-800 text-gray-100 w-full py-3 lg:py-4 rounded-lg hover:bg-slate-900 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none dark:hover:bg-slate-800">
									<svg
										className="w-6 h-6 -ml-2"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									></svg>
									<span className="mr-4 text-[15px] lg:text-[16px]">Register</span>
								</button>
							</div>
						</div>
					</form>
				</div>
			) : (
				<div>
					<p className="text-slate-800 dark:text-dark_text text-sm lg:text-base">Register an account for new administrator with their own email and password.</p>
				</div>
			)}
		</div>
	);
};

export default CreateAdminAccount;
