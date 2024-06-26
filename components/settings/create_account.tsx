"use client";

import { IoMdArrowDroprightCircle, IoMdArrowDropleftCircle, IoMdArrowDropdownCircle } from "react-icons/io";
import React, { useState, useEffect } from "react";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { auth, provider } from "../../google_config";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, deleteUser as deleteUserFromFirebase } from "firebase/auth";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import cookie from "js-cookie";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const CreateAdminAccount = () => {
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleExpansion = () => {
		setIsExpanded(!isExpanded);
	};

	const router = useRouter();

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

	const handleLogoutClick = () => {
		// Clear user data from localStorage
		localStorage.removeItem("concatenatedID");

		// Remove the cookies,
		cookie.remove("authToken");

		// Redirect to the login page after logout
		window.location.href = "/login"; // You can replace with the actual login page URL
	};

	interface User {
		firebase_uid: string;
		email_address: string;
		created_at: string;
		activation: boolean;
	}

	const [user, setUser] = useState<User[]>([]);

	const handleDelete = async (user: User) => {
		try {
			const { email_address } = user; // Assuming 'email_address' is the unique identifier for the user

			// Reauthenticate user before deleting account
			const firebaseUser = auth.currentUser;
			if (!firebaseUser) {
				throw new Error('User not authenticated');
			}

			// Delete user from Firebase
			await deleteUserFromFirebase(firebaseUser); // Use delete method directly on the user object

			// Delete user from Supabase
			const { error } = await supabase
				.from('login')
				.delete()
				.eq('email_address', email_address);

			if (error) {
				throw error;
			}

			handleLogoutClick();
			router.refresh();
		} catch (error) {
			// console.error('Error deleting user:', error.message);
		}
	};

	useEffect(() => {
		fetchUserData();
	}, []);

	const fetchUserData = async () => {
		try {
			const { data, error } = await supabase
				.from('login')
				.select('email_address, created_at, activation, firebase_uid');

			if (error) {
				throw error;
			}

			// Map the fetched data to match the User interface
			const mappedData: User[] = data.map((item: any) => ({
				firebase_uid: item.firebase_uid,
				email_address: item.email_address,
				created_at: item.created_at,
				activation: item.activation,
			}));

			setUser(mappedData || []);

		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error('Error fetching user data:', error.message);
			} else {
				console.error('Error fetching user data:', error);
			}
		}
	};

	const formatDateTime = (dateTimeString: string) => {
		const dateTime = new Date(dateTimeString);

		const day = String(dateTime.getDate()).padStart(2, '0');
		const month = String(dateTime.getMonth() + 1).padStart(2, '0');
		const year = dateTime.getFullYear();
		const hours = String(dateTime.getHours()).padStart(2, '0');
		const minutes = String(dateTime.getMinutes()).padStart(2, '0');
		const seconds = String(dateTime.getSeconds()).padStart(2, '0');

		return `${day}-${month}-${year} `;
	};

	const formatActivationStatus = (activation: boolean) => {
		return activation ? 'Active' : 'Inactive'; // Convert boolean to string
	};

	const getActivationColor = (activation: boolean) => {
		return activation ? 'text-green-600' : 'text-red-600';
	};

	const handleActivate = async (user: User) => {
		try {
			const { data, error } = await supabase
				.from('login')
				.update({ activation: true })
				.eq('firebase_uid', user.firebase_uid);

			if (error) {
				toast.error(`Error activating ${user.email_address}.`)
				return;
			}

			toast.success(`Successfully activated ${user.email_address}!`);
			fetchUserData();
			router.refresh();

		} catch (error) {
			// console.error('Error activating user:', error.message);
		}
	};

	const handleDeactivate = async (user: User) => {
		try {
			const { data, error } = await supabase
				.from('login')
				.update({ activation: false })
				.eq('firebase_uid', user.firebase_uid);

			if (error) {
				toast.error(`Error de-activating ${user.email_address}.`)
				return;
			}

			toast.success(`Successfully de-activated ${user.email_address}!`);
			fetchUserData();
			router.refresh();

			// Reload the current page
			// window.location.reload();

		} catch (error) {
			// console.error('Error deactivating user:', error);
		}
	};

	const [openDeactivateDialog, setOpenDeactivateDialog] = useState<{ [key: string]: boolean }>({});
	const toggleDeactivateDialog = (formId: string) => {
		setOpenDeactivateDialog((prev) => ({
			...prev,
			[formId]: !prev[formId],
		}));
	};

	const [openDeleteDialog, setOpenDeleteDialog] = useState<{ [key: string]: boolean }>({});
	const toggleDeleteDialog = (formId: string) => {
		setOpenDeleteDialog((prev) => ({
			...prev,
			[formId]: !prev[formId],
		}));
	};

	const [openActivateDialog, setOpenActivateDialog] = useState<{ [key: string]: boolean }>({});
	const toggleActivateDialog = (formId: string) => {
		setOpenActivateDialog((prev) => ({
			...prev,
			[formId]: !prev[formId],
		}));
	};

	return (
		<div>
			<div onClick={toggleExpansion} className="flex cursor-pointer">
				<div className="mr-2">
					{isExpanded ? (
						<IoMdArrowDropdownCircle className="text-[27px] lg:text-[30px] dark:text-dark_text" />
					) : (
						<IoMdArrowDroprightCircle className="text-[27px] lg:text-[30px] dark:text-dark_text" />
					)}
				</div>
				<h1 className="font-bold text-[18px] lg:text-[20px] dark:text-dark_text">Administrator Account Registration</h1>
			</div>

			{isExpanded ? (
				<div className="transition-max-h duration-300 ease-linear w-full lg:flex">
					<div className="w-3/4 mt-[30px] ml-[50px] mr-[50px] overflow-y-auto border-r-2 border-slate-200 pr-8">
						<p className="text-xl lg:text-2xl font-medium mb-6 text-center text-slate-800 dark:text-[#E8E6E3]">Account Details</p>

						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50 dark:bg-gray-800">
								<tr>
									<th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										ID
									</th>
									<th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										Registered Email Address
									</th>
									<th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										Created At
									</th>
									<th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										Action
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900">
								{user.map((user, index) => (
									<tr key={index}>
										<td className="text-center px-6 py-4 whitespace-nowrap">{index + 1}</td>
										<td className=" text-center px-6 py-4 whitespace-nowrap">{user.email_address}</td>
										<td className="text-center px-6 py-4 whitespace-nowrap">
											{formatDateTime(user.created_at)}
										</td>
										<td className={`text-center px-6 py-4 whitespace-nowrap uppercase font-bold ${getActivationColor(user.activation)}`}>
											{formatActivationStatus(user.activation)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-center">
											{user.activation ? (
												<Button className="bg-red-600 hover:bg-red-900" onClick={() => toggleDeactivateDialog(user.firebase_uid)}>Deactivate</Button>
											) : (
												<Button className="bg-green-600 hover:bg-green-900 pl-6 pr-6" onClick={() => toggleActivateDialog(user.firebase_uid)}>Activate</Button>
											)}

											<Dialog
												open={openDeactivateDialog[user.firebase_uid]}
												onOpenChange={() => toggleDeactivateDialog(user.firebase_uid)}
											>
												<DialogTrigger asChild>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>De-activation Confirmation</DialogTitle>
													</DialogHeader>
													<DialogDescription>
														Are you sure you want to de-activate this account? You may opt to re-activate anytime later.
													</DialogDescription>
													<DialogFooter>
														<DialogClose asChild>
															Close
														</DialogClose>
														<Button
															onMouseUp={() => {
																toggleDeactivateDialog(user.firebase_uid);
																handleDeactivate(user);
															}}>
															De-activate
														</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>

											<Dialog
												open={openActivateDialog[user.firebase_uid]}
												onOpenChange={() => toggleActivateDialog(user.firebase_uid)}
											>
												<DialogTrigger asChild>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Activation Confirmation</DialogTitle>
													</DialogHeader>
													<DialogDescription>
														Are you sure you want to activate this account? The user will have access to the system again.
													</DialogDescription>
													<DialogFooter>
														<DialogClose asChild>
															Close
														</DialogClose>
														<Button
															onMouseUp={() => {
																toggleActivateDialog(user.firebase_uid);
																handleActivate(user);
															}}>
															Activate
														</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>
											{/* <Button className="bg-red-600 hover:bg-red-900 ml-[6px]" onClick={() => handleDelete(user as User)}>Delete</Button> */}
											<Dialog
												open={openDeleteDialog[user.firebase_uid]}
												onOpenChange={() => toggleDeleteDialog(user.firebase_uid)}
											>
												<DialogTrigger asChild>
													<Button
														className="bg-red-600 hover:bg-red-900 ml-[6px]"
														type="button"
													>
														Delete
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Deletion Confirmation</DialogTitle>
													</DialogHeader>
													<DialogDescription>
														Are you sure you want to delete this account? The user will no longer have access to this system and they will not be able to register with this
														email again. If unsure, please de-activate account instead.
													</DialogDescription>
													<DialogFooter>
														<DialogClose asChild>
															Close
														</DialogClose>
														<Button
															onMouseUp={() => {
																toggleDeleteDialog(user.firebase_uid);
																handleDelete(user as User);
															}}>
															Delete
														</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>
										</td>
									</tr>
								))}
							</tbody>

						</table>

					</div>

					<div className="lg:w-1/4">
						<form onSubmit={e => handleCreateAccount(e)}>
							<div className="mb-[0px] lg:mb-[20px] mt-[30px] dark:bg-dark_mode_card">
								<div className="">
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
				</div>
			) : (
				<div className="ml-[38px]">
					<p className="text-slate-800 dark:text-dark_text text-sm lg:text-base">Register an account for new administrator with their own email and password.</p>
				</div>
			)}
		</div>
	);
};

export default CreateAdminAccount;
