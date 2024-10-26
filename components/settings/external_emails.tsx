
"use client";

import { IoMdArrowDroprightCircle, IoMdArrowDropleftCircle } from "react-icons/io";
import React, { useState, useEffect, SetStateAction } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { HiPencilAlt } from "react-icons/hi";
import { BsFillTrash3Fill } from "react-icons/bs";
import { IoMdAdd, IoIosAddCircleOutline, IoIosCloseCircleOutline, IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import { Tab } from "@headlessui/react";
import DeleteModal from "@/components/EditEvent_Modal";
import AddFacultyUnitModal from "@/components/EditEvent_Modal";

const AttendanceSettings = () => {

	type Email = {
		extEID: string;
		extEMail: string;
		extEName: string;
		extECategory: number;
	}

	const supabase = createClientComponentClient();
	const [isExpanded, setIsExpanded] = useState(false);
	const [activeTab, setActiveTab] = useState("Verification");
	const [emails, setEmails] = useState<Email[]>([]);
	const [editOption, setEditOption] = useState("");
	const [cancelOptionUpdate, setCancelOptionUpdate] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [updateOption, setUpdateOption] = useState(false);
	const [newEmail, setNewEmail] = useState("");
	const [newName, setNewName] = useState("");
	const [editedEmail, setEditedEmail] = useState("");
	const [editedName, setEditedName] = useState("");

	const toggleExpansion = () => {
		setIsExpanded(!isExpanded);
	};

	const fetchEmails = async () => {
		const { data, error } = await supabase
			.from("external_emails")
			.select("*");

		if (error) {
			return;
		}

		console.log(data);
		setEmails(data || []);
	};

	useEffect(() => {
		fetchEmails();
	}, []);

	const createNewEmail = async (newEmail: string, extECategory: number, newName: string) => {
		try {
			const { error } = await supabase
				.from('external_emails')
				.insert({
					extEMail: newEmail,
					extEName: newName,
					extECategory: extECategory
				})

			fetchEmails();
			setNewEmail('');
			setNewName('');
		} catch (error) {

		}
	}

	const handleUpdateEmail = async (extEID: string, updatedEmail: string, updatedName: string) => {
		try {
			const { error } = await supabase
				.from('external_emails')
				.update({ extEMail: updatedEmail, extEName: updatedName })
				.eq('extEID', extEID)

			if (error) {
				return;
			}

			fetchEmails();
			setEditedEmail('');

		} catch (error) {

		}
	}

	const handleEditOption = (extEID: string, extEMail: string, extEName: string) => {
		setEditOption(extEID);
		setUpdateOption(true);
		setCancelOptionUpdate(!cancelOptionUpdate);
		setEditedEmail(extEMail);
		setEditedName(extEName);
	}

	const [deletingEmail, setDeletingEmail] = useState({ id: "", email: "", name: "" });;

	const openDeleteModal = (extEID: string, extEMail: string, extEName: string) => {
		setDeletingEmail({ id: extEID, email: extEMail, name: extEName });
		setShowDeleteModal(!showDeleteModal);
	}

	const handleDeleteEmail = async (extEID: string) => {
		try {
			const { error } = await supabase
				.from('external_emails')
				.delete()
				.eq('extEID', extEID);

			if (error) {
				return;
			}

			setEmails(prevEmails => prevEmails.filter(email => email.extEID !== extEID));
			setShowDeleteModal(!showDeleteModal);
		} catch (error) {

		}
	}

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
				<h1 className="font-bold text-[18px] lg:text-[20px] dark:text-dark_text">External Forms Emails</h1>
			</div>

			{isExpanded ? (
				<div className="transition-max-h duration-300 ease-linear w-full">
					<div className="overflow-y-auto max-h-[500px] mt-1 pl-10 pb-10">
						<div className="text-slate-900 dark:text-dark_text mb-3 text-sm lg:text-base">
							<p>Please take note,</p>
							<p>Verification - Head of School/ Manager/ Associate Dean of Research</p>
							<p>Approval - Head of Management Unit/ Dean</p>
						</div>
						<Tab.Group>
							<Tab.List className="">
								<Tab
									className={`font-bold items-center rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 dark:hover:bg-[#2F3335] shadow-sm mb-3.5 pt-2 pb-2 pl-3 pr-3 mr-2 focus:outline-none
                                        ${activeTab === "Verification"
											? "bg-red-600 text-white"
											: "bg-slate-200 text-slate-800 dark:bg-[#242729] dark:text-[#CCC7C1]"
										}`}
									onClick={() => setActiveTab("Verification")}
								>
									Verification
								</Tab>
								<Tab
									className={`font-bold items-center rounded-lg lg:text-[15px] text-[12px] hover:bg-red-200 dark:hover:bg-[#2F3335] shadow-sm mb-3.5 pt-2 pb-2 pl-3 pr-3 mr-2 focus:outline-none
                                        ${activeTab === "Approval"
											? "bg-red-600 text-white"
											: "bg-slate-200 text-slate-800 dark:bg-[#242729] dark:text-[#CCC7C1]"
										}`}
									onClick={() => setActiveTab("Approval")}
								>
									Approval
								</Tab>
							</Tab.List>

							<Tab.Panels>
								<Tab.Panel>
									<div className="flex space-x-10">
										<table className="lg:w-3/4">
											<thead>
												<tr>
													<th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F] w-1/4">
														No
													</th>

													<th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F] w-1/4">
														<p className="text-left">Name</p>
													</th>

													<th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F] w-1/4">
														<p className="text-left">Email</p>
													</th>

													<th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F] w-1/4">
														<div className="ml-8">Action</div>
													</th>
												</tr>
											</thead>
											<tbody>
												{emails
													.filter(emails => emails.extECategory === 1)
													.map((emails, index) =>
														emails.extEID === editOption && updateOption && !cancelOptionUpdate && 1 ? (
															<tr key={index} className="">
																<td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/4 ">
																	{index + 1}
																</td>

																<td className="flex-1 lg:px-[33px] py-3s border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider w-1/4">
																	<input
																		type="text"
																		placeholder="Enter Name..."
																		className="border-2 ml-3 px-2 py-1 text-base w-full"
																		value={editedName}
																		onChange={e => setEditedName(e.target.value)}
																	/>
																</td>

																<td className="flex-1 lg:px-[33px] py-3s border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider w-1/4">
																	<input
																		type="text"
																		placeholder="Enter Email..."
																		className="border-2 ml-3 px-2 py-1 text-base w-full"
																		value={editedEmail}
																		onChange={e => setEditedEmail(e.target.value)}
																	/>
																</td>

																<td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-3/4">
																	<button
																		className="border-[0.5px] rounded-md bg-slate-900 p-2 text-white hover:bg-red-600 duration-300 ease-in-out"
																		onClick={() => {
																			if (editedEmail.length > 0 || editedName.length > 0) {
																				setEmails(prevEmail => {
																					const updatedEmails = [...prevEmail];
																					updatedEmails[index].extEMail = editedEmail;
																					return updatedEmails;
																				});

																				handleUpdateEmail(emails.extEID, editedEmail, editedName);
																			}

																			setUpdateOption(!updateOption);
																		}}
																	>
																		Update
																	</button>
																	<button
																		className="border-[0.5px] rounded-md bg-slate-100 px-3 py-2 hover:bg-slate-200 duration-300 ease-in-out"
																		onClick={() => { setCancelOptionUpdate(!cancelOptionUpdate); }}
																	>
																		Cancel
																	</button>
																</td>
															</tr>
														) : (
															<tr key={index}>
																<td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-center w-1/4 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
																	{index + 1}
																</td>

																<td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-left w-1/2 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
																	{emails.extEName}
																</td>

																<td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-left w-1/2 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
																	{emails.extEMail}
																</td>

																<td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-center w-3/4 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
																	<div className="flex ml-8">
																		<button
																			onClick={() => {
																				handleEditOption(emails.extEID, emails.extEMail, emails.extEName);
																			}}
																		>
																			<HiPencilAlt className="text-slate-700 hover:scale-105 mt-[3px] lg:mt-[1px] text-[14px] lg:text-base dark:text-dark_text" />
																		</button>
																		<button
																			onClick={() => openDeleteModal(emails.extEID, emails.extEMail, emails.extEName)}
																		>
																			<BsFillTrash3Fill className="text-slate-700 hover:scale-105 ml-6 mt-[3px] lg:mt-[1px] text-[14px] lg:text-base dark:text-dark_text" />
																		</button>
																	</div>
																</td>
															</tr>
														),
													)}
											</tbody>
										</table>

										<div className="lg:w-1/4 border-2 p-7 shadow-lg dark:bg-dark_mode_card mt-5 lg:mt-0 self-start">
											<p className="font-bold text-md dark:text-dark_text text-sm lg:text-base">Add Verifier Email</p>
											<div className="flex flex-col">
												<label htmlFor="nameInput" className="font-medium text-gray-700 text-sm lg:text-base dark:text-dark_text">
													Full Name
												</label>
												<input
													id="nameInput"
													type="text"
													placeholder="e.g., John Doe"
													value={newName}
													className="mb-3 border-[1px] border-slate-200 rounded-sm w-full px-2 py-1 dark:border-[#27374C] dark:bg-dark_mode_card text-sm lg:text-base"
													onChange={e => setNewName(e.target.value)}
												/>
											</div>
											<div className="flex flex-col">
												<label htmlFor="emailInput" className="font-medium text-gray-700 text-sm lg:text-base dark:text-dark_text">
													Email Address
												</label>
												<input
													id="emailInput"
													type="text"
													placeholder="e.g., hos@gmail.com"
													value={newEmail}
													className="mb-3 border-[1px] border-slate-200 rounded-sm w-full px-2 py-1 dark:border-[#27374C] dark:bg-dark_mode_card text-sm lg:text-base"
													onChange={e => setNewEmail(e.target.value)}
												/>
											</div>

											<div className="flex justify-end">
												<button
													className={`mt-4 lg:mt-7 rounded-lg py-[9px] lg:py-3 px-[28px] lg:px-[25px] font-medium focus:shadow-outline focus:outline-none focus:ring-2 text-sm lg:text-base dark:text-dark_text dark:border-[#736B5E] ${!newEmail ? 'bg-gray-200 text-slate-900 cursor-default duration-300 ease-out' : 'text-white bg-slate-900 hover:bg-red-600 hover:text-slate-50 hover:transition duration-300 transform hover:scale-105 cursor-pointer'}`}
													onClick={() => { createNewEmail(newEmail, 1, newName); }}
													disabled={!newEmail}
												>
													Add
												</button>
											</div>
										</div>
									</div>

								</Tab.Panel>

								<Tab.Panel>
									<div className="flex space-x-10">
										<table className="lg:w-3/4">
											<thead>
												<tr>
													<th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F]">
														No
													</th>

													<th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F] w-1/4">
														<p className="text-left">Name</p>
													</th>

													<th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F]">
														<p className="text-left">Email</p>
													</th>

													<th className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-gray-100 text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center dark:border-[#363B3D] dark:bg-[#1D2021] dark:text-[#B0AA9F]">
														Action
													</th>
												</tr>
											</thead>
											<tbody>
												{emails
													.filter(emails => emails.extECategory === 2)
													.map((emails, index) =>
														emails.extEID === editOption && updateOption && !cancelOptionUpdate ? (
															<tr key={index} className="">
																<td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-1/4 ">
																	{index + 1}
																</td>

																<td className="flex-1 lg:px-[33px] py-3s border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider w-1/4">
																	<input
																		type="text"
																		placeholder="Enter Name..."
																		className="border-2 ml-3 px-2 py-1 text-base w-full"
																		value={editedName}
																		onChange={e => setEditedName(e.target.value)}
																	/>
																</td>

																<td className="flex-1 lg:px-[33px] py-3s border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider w-1/4">
																	<input
																		type="text"
																		placeholder="Enter Email..."
																		className="border-2 ml-3 px-2 py-1 text-base w-full"
																		value={editedEmail}
																		onChange={e => setEditedEmail(e.target.value)}
																	/>
																</td>

																<td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider text-center w-3/4">
																	<button
																		className="border-[0.5px] rounded-md bg-slate-900 p-2 text-white hover:bg-red-600 duration-300 ease-in-out"
																		onClick={() => {
																			if (editedEmail.length > 0) {
																				setEmails(prevEmail => {
																					const updatedEmails = [...prevEmail];
																					updatedEmails[index].extEMail = editedEmail;
																					return updatedEmails;
																				});

																				handleUpdateEmail(emails.extEID, editedEmail, editedName);
																			}

																			setUpdateOption(!updateOption);
																		}}
																	>
																		Update
																	</button>
																	<button
																		className="border-[0.5px] rounded-md bg-slate-100 px-3 py-2  hover:bg-slate-200 duration-300 ease-in-out"
																		onClick={() => { setCancelOptionUpdate(!cancelOptionUpdate); }}
																	>
																		Cancel
																	</button>
																</td>
															</tr>
														) : (
															<tr key={index}>
																<td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-center w-1/4 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
																	{index + 1}
																</td>

																<td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-left w-1/2 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
																	{emails.extEName}
																</td>

																<td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-left w-1/2 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
																	{emails.extEMail}
																</td>

																<td className="flex-1 lg:px-[33px] py-3 border-b-2 border-gray-200 bg-white text-xs lg:text-base font-semibold text-gray-600 tracking-wider text-center w-3/4 dark:bg-dark_mode_card dark:border-[#363B3D] dark:text-dark_text">
																	<div className="flex ml-8">
																		<button
																			onClick={() => {
																				handleEditOption(emails.extEID, emails.extEMail, emails.extEName);
																			}}
																		>
																			<HiPencilAlt className="text-slate-700 hover:scale-105 mt-[3px] lg:mt-[1px] text-[14px] lg:text-base dark:text-dark_text" />
																		</button>
																		<button
																			onClick={() => openDeleteModal(emails.extEID, emails.extEMail, emails.extEName)}
																		>
																			<BsFillTrash3Fill className="text-slate-700 hover:scale-105 ml-6 mt-[3px] lg:mt-[1px] text-[14px] lg:text-base dark:text-dark_text" />
																		</button>
																	</div>
																</td>
															</tr>
														),
													)}
											</tbody>
										</table>

										<div className="lg:w-1/4 border-2 p-7 lg:mr-72 shadow-lg dark:bg-dark_mode_card flex flex-col">
											<p className="font-bold text-md dark:text-dark_text text-sm lg:text-base">Add Approver Email</p>
											<div className="flex flex-col">
												<label htmlFor="nameInput" className="font-medium text-gray-700 text-sm lg:text-base dark:text-dark_text">
													Full Name
												</label>
												<input
													id="nameInput"
													type="text"
													placeholder="e.g., John Doe"
													value={newName}
													className="mb-3 border-[1px] border-slate-200 rounded-sm w-full px-2 py-1 dark:border-[#27374C] dark:bg-dark_mode_card text-sm lg:text-base"
													onChange={e => setNewName(e.target.value)}
												/>
											</div>
											<div className="flex flex-col">
												<label htmlFor="emailInput" className="font-medium text-gray-700 text-sm lg:text-base dark:text-dark_text">
													Email Address
												</label>
												<input
													id="emailInput"
													type="text"
													placeholder="e.g., hmu@gmail.com"
													value={newEmail}
													className="mb-3 border-[1px] border-slate-200 rounded-sm w-full px-2 py-1 dark:border-[#27374C] dark:bg-dark_mode_card text-sm lg:text-base"
													onChange={e => setNewEmail(e.target.value)}
												/>
											</div>

											<div className="flex justify-end">
												<button
													className={`-mt-2 lg:mt-2 rounded-lg py-2 lg:py-3 px-[27px] lg:px-[25px] font-medium focus:shadow-outline focus:outline-none focus:ring-2 text-sm lg:text-base dark:text-dark_text dark:border-[#736B5E] ${!newEmail ? 'border bg-gray-200 text-slate-900 cursor-default duration-300 ease-out' : 'text-white  bg-slate-900 hover:bg-red-600 hover:text-slate-50 hover:transition duration-300 transform hover:scale-105 cursor-pointer '}`}
													onClick={() => { createNewEmail(newEmail, 2, newName); }}
													disabled={!newEmail}
												>
													Add
												</button>
											</div>
										</div>
									</div>

								</Tab.Panel>
							</Tab.Panels>
						</Tab.Group>
					</div>
				</div>
			) : (
				<div className="ml-[38px]">
					<p className="text-slate-900 dark:text-dark_text text-sm lg:text-base">
						Change the email options for HOS/ MGR/ ADCR/ HMU/ Dean in Nominations/ Travelling Form&apos;s (NTF) for verification and
						approval.
					</p>
				</div>
			)}

			<DeleteModal
				isVisible={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}>
				<div className="p-4 text-lg text-center">
					<IoIosCloseCircleOutline className="m-auto text-8xl text-red-600" />
					<p className="mt-6">Are you sure to delete <span className="font-bold">{deletingEmail.email}</span>? This action cannot be undone.</p>

					<div className="mt-12">
						<button
							className="border-[0.5px] rounded-md bg-white px-6 py-2 font-semibold hover:bg-slate-100 duration-300 ease-in-out"
							onClick={() => setShowDeleteModal(false)}>Cancel</button>

						<button
							className="border-2 rounded-md bg-red-600 ml-2 text-white px-6 py-2 font-semibold hover:bg-red-700 duration-300 ease-in-out"
							onClick={() => handleDeleteEmail(deletingEmail.id)}>Delete</button>
					</div>
				</div>
			</DeleteModal>
		</div>
	);
};

export default AttendanceSettings;






