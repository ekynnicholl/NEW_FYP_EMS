"use client";

import { useEffect, useRef, useState } from "react";

import MobileTopBar from "./MobileTopBar";
import AddAdmin_Modal from "@/components/AddAdmin_Modal";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
	signOut,
	getAuth,
	createUserWithEmailAndPassword,
	sendEmailVerification,
	signInWithEmailAndPassword,
	deleteUser as deleteUserFromFirebase,
} from "firebase/auth";

import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import useViewModeStore from "@/components/zustand/viewModeStorage";
import useDarkLight from "@/components/zustand/darkLightStorage";
import { IoIosArrowDown } from "react-icons/io";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { BiSun } from "react-icons/bi";
import { HiOutlineMoon } from "react-icons/hi";
import Notification from "@/components/notifications/notification_topbar";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const User = () => {
	return (
		<div className="cursor-pointer">
			<DropdownMenu>
				<DropdownMenuTrigger asChild></DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>Logout</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

const BreadCrumb = () => {
	const pathname = usePathname();

	if (pathname === "/dashboard") {
		return (
			<div className="flex items-center space-x-2 text-[15px] ml-[11px] text-slate-800 dark:text-dark_text">
				<Link href="/dashboard">Home</Link>
				<p>/</p>
				<Link href="/dashboard" className="underline underline-offset-4 font-medium">
					Dashboard
				</Link>
			</div>
		);
	}

	// convert /dashboard to Dashboard
	const path = pathname.substring(1, pathname.length);
	const pathArray = path.split("/");
	const pathArrayLength = pathArray.length;
	const lastPath = pathArray[pathArrayLength - 1];
	const lastPathCapitalized = lastPath.charAt(0).toUpperCase() + lastPath.slice(1);
	const lastPathSpaced = lastPathCapitalized.replace(/([a-z])([A-Z])/g, "$1 $2");

	return (
		<div className="flex items-center space-x-2 text-[15px] ml-[11px] text-slate-800 dark:text-dark_text">
			<Link href="/dashboard">Home</Link>
			<p>/</p>
			<Link href={pathname} className="underline underline-offset-4 font-medium">
				{lastPathSpaced}
			</Link>
		</div>
	);
};

interface TopBarProps {
	onViewModeChange: (id: number) => void;
	onIsDarkModeChange: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onViewModeChange, onIsDarkModeChange }) => {
	const [homepageView, setHomepageView] = useState(1);
	const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
	const router = useRouter();
	const auth = getAuth();

	useEffect(() => {
		fetchHomepageView();
		fetchIsDarkMode();
	}, []);

	const fetchHomepageView = async () => {
		const { data, error } = await supabase
			.from("login")
			.select("accHomeView")
			.eq("firebase_uid", auth.currentUser?.uid);

		if (error) {
			console.error("Error fetching homepageView:", error);
			return;
		}

		// Set the homepageView based on the fetched value
		setHomepageView(data[0]?.accHomeView ?? "1");
		useViewModeStore.setState({ viewMode: data[0]?.accHomeView ?? "1" });
	};

	const fetchIsDarkMode = async () => {
		const { data, error } = await supabase
			.from("login")
			.select("accIsDarkMode")
			.eq("firebase_uid", auth.currentUser?.uid); // Use the appropriate accID

		if (error) {
			console.error("Error fetching IsDarkMode:", error);
			return;
		}

		const accIsDarkMode = data?.[0]?.accIsDarkMode ?? false;

		// Set the homepageView based on the fetched value
		setIsDarkMode(accIsDarkMode);
		useDarkLight.setState({ isDarkMode: accIsDarkMode });

		if (accIsDarkMode) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	};

	// 0 is vanilla, 1 is dark mode.
	const updateIsDarkMode = async (status: boolean) => {
		const { data, error } = await supabase
			.from("login")
			.update({ accIsDarkMode: status })
			.eq("firebase_uid", auth.currentUser?.uid)
			.select();

		if (error) {
			console.error("Update failed:", error);
			return;
		} else {
			fetchIsDarkMode();
			onIsDarkModeChange();
		}
	};

	const handleLogoutClick = () => {
		signOut(auth)
			.then(() => {
				router.push("/login");
				toast.success("Signed out successfully");
			})
			.catch(error => {
				toast.error("Error signing out");
			});
	};

	const updateHomepageView = async (id: number) => {
		const { error } = await supabase
			.from("login")
			.update({ accHomeView: id })
			.eq("firebase_uid", auth.currentUser?.uid);

		if (error) {
			console.error("Update failed:", error);
			return;
		} else {
			fetchHomepageView();
			onViewModeChange(id);
		}
	};

	const [showModalAddAdmin, setShowModalAddAdmin] = useState(false);

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
				throw new Error("User not authenticated");
			}

			// Delete user from Firebase
			await deleteUserFromFirebase(firebaseUser); // Use delete method directly on the user object

			// Delete user from Supabase
			const { error } = await supabase
				.from("login")
				.delete()
				.eq("email_address", email_address);

			if (error) {
				throw error;
			}

			handleLogoutClick();
		} catch (error) {
			console.error("Error deleting user:", error);
		}
	};

	useEffect(() => {
		fetchUserData();
	}, []);

	const fetchUserData = async () => {
		try {
			const { data, error } = await supabase.from("login").select("firebase_uid, email_address, created_at, activation");

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
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error fetching user data:", error.message);
			} else {
				console.error("Error fetching user data:", error);
			}
		}
	};

	const formatDateTime = (dateTimeString: string) => {
		const dateTime = new Date(dateTimeString);

		const day = String(dateTime.getDate()).padStart(2, "0");
		const month = String(dateTime.getMonth() + 1).padStart(2, "0");
		const year = dateTime.getFullYear();

		return `${day}-${month}-${year} `;
	};

	const formatActivationStatus = (activation: boolean) => {
		return activation ? "Activated" : "Not Activated";
	};

	const getActivationColor = (activation: boolean) => {
		return activation ? "text-green-600" : "text-red-600";
	};

	const handleActivate = async (user: User) => {
		const { error } = await supabase
			.from("login")
			.update({ activation: true })
			.eq("firebase_uid", user.firebase_uid);

		if (error) {
			toast.error("Error activating user");
		} else {
			toast.success("User activated successfully");
			router.refresh();
		}

	};

	const handleDeactivate = async (user: User) => {
		const { error } = await supabase
		.from("login")
		.update({ activation: false })
		.eq("firebase_uid", user.firebase_uid);

		if (error) {
			toast.error("Error deactivating user");
		} else {
			toast.success("User deactivated successfully");
			router.refresh();
		}
	};

	return (
		// <div className={`top-0 left-0 w-full ${isDarkMode ? 'bg-black-500' : 'bg-white border-b'} p-4 flex justify-end items-center`}>
		<div className="w-full p-4 flex justify-between items-center bg-white dark:bg-dark_mode_card max-md:flex-row-reverse">
			<AddAdmin_Modal isVisible={showModalAddAdmin} onClose={() => setShowModalAddAdmin(false)}>
				<div className="flex">
					<div className="mt-[30px] ml-[50px] mr-[50px] overflow-y-auto border-r-2 border-slate-200 pr-8">
						<p className="text-2xl font-medium mb-6 text-center text-slate-800 dark:text-[#E8E6E3]">Account Details</p>
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50 dark:bg-gray-800">
								<tr>
									<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										ID
									</th>
									<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Registered Email Address
									</th>
									<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Created At
									</th>
									<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Action
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900">
								{user.map((user, index) => (
									<tr key={index}>
										<td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
										<td className="px-6 py-4 whitespace-nowrap">{user.email_address}</td>
										<td className="px-6 py-4 whitespace-nowrap">{formatDateTime(user.created_at)}</td>
										<td className={`px-6 py-4 whitespace-nowrap ${getActivationColor(user.activation)}`}>
											{formatActivationStatus(user.activation)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(user as User)}>
												Delete
											</button>
											{user.activation ? (
												<button className="text-red-600 hover:text-red-900 ml-[6px]" onClick={() => handleDeactivate(user)}>
													Deactivate
												</button>
											) : (
												<button className="text-green-600 hover:text-green-900 ml-[6px]" onClick={() => handleActivate(user)}>
													Activate
												</button>
											)}
											<button className="bg-red-600 text-white hover:bg-red-700 hover:font-bold ml-[6px] rounded-md px-[13px] py-2" onClick={() => handleDelete(user as User)}>Delete</button>

										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<form onSubmit={e => handleCreateAccount(e)}>
						<div className="mb-[0px] lg:mb-[20px] mt-[30px] dark:bg-dark_mode_card">
							<div className="mx-auto max-w-xs">
								<p className="text-2xl font-medium mb-6 text-center text-slate-800 dark:text-[#E8E6E3]">Create an Account</p>
								<input
									className="w-full px-8 py-4 pl-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white dark:bg-[#1D2021] dark:border-[#363B3D] placeholder:[#5C5A53] dark:text-slate-300 dark:focus:bg-[#1D2021]"
									type="email"
									placeholder="Email address"
									name="email"
									required
								/>
								<p className="text-red-500 text-left ml-[6px] mt-0 text-xs">{errorMessageEmailAddress}</p>

								<div className="relative">
									<input
										className="w-full px-8 py-4 pl-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5 dark:bg-[#1D2021] dark:border-[#363B3D] placeholder:[#5C5A53] dark:text-slate-300 dark:focus:bg-[#1D2021]"
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
										className="w-full px-8 py-4 pl-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5 dark:bg-[#1D2021] dark:border-[#363B3D] placeholder:[#5C5A53] dark:text-slate-300 dark:focus:bg-[#1D2021]"
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
								<button className="mt-10 tracking-wide font-semibold bg-slate-800 text-gray-100 w-full py-4 rounded-lg hover:bg-slate-900 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none dark:hover:bg-slate-800">
									<svg
										className="w-6 h-6 -ml-2"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									></svg>
									<span className="mr-4 text-[16px]">Register</span>
								</button>
							</div>
						</div>
					</form>
				</div>
			</AddAdmin_Modal>

			<div className="max-md:hidden">
				<BreadCrumb />
			</div>

			<div className="flex space-x-6 pr-2 pl-12 max-md:hidden">
				<div className="rounded-full p-[6px] bg-slate-100 cursor-pointer mt-[3px] opacity-80 hover:opacity-90 dark:bg-[#1D1F1F]">
					{isDarkMode ? (
						<BiSun className="text-[27px] text-slate-900 dark:text-dark_text" onClick={() => updateIsDarkMode(false)} />
					) : (
						<HiOutlineMoon className="text-[27px] text-slate-900 dark:text-dark_text" onClick={() => updateIsDarkMode(true)} />
					)}
				</div>
				<Notification />
				<div className="cursor-pointer">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<div className="rounded-full bg-slate-100 p-2 opacity-80 hover:opacity-90 mt-[3px] dark:bg-[#1D1F1F]">
								<BiDotsVerticalRounded className="text-[24px] text-slate-900 dark:text-dark_text" />
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem onClick={() => updateHomepageView(1)} className={homepageView === 1 ? "text-blue-500" : ""}>
								Card View
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => updateHomepageView(2)} className={homepageView === 2 ? "text-blue-500" : ""}>
								List View
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<User />
				<div className="flex items-center justify-center">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<div className="flex items-center gap-3 cursor-pointer">
								<p className=" text-slate-700 text-[15px] font-medium dark:text-dark_text">Administrator</p>
								<IoIosArrowDown className="text-slate-800 dark:text-dark_text mt-[2.5px]" />
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuLabel>{auth.currentUser?.email}</DropdownMenuLabel>
							<DropdownMenuItem onClick={() => setShowModalAddAdmin(true)}>Admin Registration</DropdownMenuItem>
							<DropdownMenuItem onClick={handleLogoutClick}>Logout</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<MobileTopBar />
		</div>
	);
};

export default TopBar;
