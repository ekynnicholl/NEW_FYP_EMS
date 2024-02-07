"use client";

import SideBarDesktop from "@/components/layouts/SideBarDesktop";
import TopBar from "@/components/layouts/TopBar";

import React, { useEffect } from "react";
import Image from "next/image";
import chatbot_bg from "@/public/images/chatbot_bg3.png";
import robot_profile from "@/public/images/robot_icon1.png";
import user_profile from "@/public/images/user_icon1.png";
import { BsSend } from "react-icons/bs";

import { useChat, Message } from "ai/react";

export default function Home() {
	const { input, handleInputChange, handleSubmit, isLoading, messages } = useChat();

	// const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
	//   if (event.key === 'Enter' && !event.shiftKey) {
	//     handleSubmit(event);
	//   }
	// };

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault(); // Prevent default behavior of Enter key
		}
	};

	return (
		<div className="h-screen">
			<div className="min-h-[670px] text-gray-900 flex justify-center dark:bg-dark_mode_bg">
				<div className="max-w-screen m-0 lg:m-6 bg-white shadow sm:rounded-lg flex justify-center flex-1 lg:flex-row dark:bg-dark_mode_card">
					<div className="hidden lg:flex flex-1 bg-slate-100 text-center dark:bg-dark_mode_bg">
						<div
							className="m-[140px] w-full bg-cover bg-center bg-no-repeat h-full"
							style={{
								backgroundImage: `url(${chatbot_bg.src})`,
								minHeight: "100%",
								marginTop: "-3px",
							}}></div>
					</div>
					<div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 flex flex-col justify-start items-start">
						<div className="mt-12">
							<div className="w-full -mt-16">
								<div
									className="bg-slate-100 px-6 py-4 rounded-md mt-3 dark:bg-dark_mode_bg"
									style={{
										maxHeight: "530px",
										minHeight: "300px",
										overflowY: "auto",
										maxWidth: "500px",
									}}>
									<div className="flex flex-col">
										<div className="mb-4">
											<div className="flex items-center">
												<Image
													src={robot_profile}
													alt="logo"
													className="w-12 h-12 rounded-full bg-slate-50 dark:bg-[#1B1D1E]"
												/>
												<p className="text-sm ml-2 font-bold text-slate-800 dark:text-dark_text">
													Friendly Bot
												</p>
											</div>
											<p className="text-xs bg-white p-2 rounded-md mt-2 dark:bg-dark_mode_card dark:text-dark_text">
												Hello! How can I assist you today?
											</p>
										</div>
										{messages.map((message: Message) => (
											<div className=" mb-4" key={message.id}>
												{message.role === "assistant" ? (
													<div className="flex items-center">
														<Image
															src={robot_profile}
															alt="logo"
															className="w-12 h-12 rounded-full bg-slate-50 dark:bg-[#1B1D1E]"
														/>
														<p className="text-sm ml-2 font-bold text-slate-800 dark:text-dark_text">
															Friendly Bot
														</p>
													</div>
												) : (
													<div className="flex items-center justify-end">
														<Image
															src={user_profile}
															alt="logo"
															className="w-9 h-9 rounded-full bg-slate-50 dark:bg-[#1B1D1E]"
														/>
														<p className="text-sm ml-2 font-bold text-slate-800 dark:text-dark_text">
															User
														</p>
													</div>
												)}
												{message.content
													.split("\n")
													.map(
														(
															currentTextBlock: string,
															index: number,
														) => {
															if (
																currentTextBlock !==
																""
															) {
																return (
																	<p
																		className="text-xs bg-white p-2 rounded-md mt-2 dark:bg-dark_mode_card dark:text-dark_text"
																		key={
																			message.id +
																			index
																		}>
																		{
																			currentTextBlock
																		}
																	</p>
																);
															}
														},
													)}
											</div>
										))}
									</div>
								</div>
							</div>
							<form
								className="mt-6 flex items-center"
								onSubmit={handleSubmit}>
								<input
									type="text"
									className="flex-1 bg-slate-100 p-2 pl-4 rounded-full text-xs lg:text-sm text-slate-800 dark:bg-dark_mode_bg dark:text-dark_text dark:placeholder:text-slate-500"
									placeholder="Ask about your events here..."
									value={input}
									onChange={handleInputChange}
									onKeyDown={handleKeyDown}
								/>
								<button
									type="submit"
									className="bg-slate-800 p-2 rounded-full ml-2">
									<BsSend color="white" size={18} />
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
