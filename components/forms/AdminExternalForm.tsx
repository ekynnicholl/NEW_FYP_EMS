"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import SignaturePad from "react-signature-canvas";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";
import NTFPDF from "@/components/forms/NTFPDF";
import TooltipIcon from "@/components/icons/TooltipIcon";

import { BsFiletypePdf } from "react-icons/bs";

import adminExternalFormSchema from "@/schema/adminExternalFormSchema";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar-year";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { toast } from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { sendContactForm } from "@/lib/api";
import type { FieldValues } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { getAuth } from "firebase/auth";
import { X } from "lucide-react"
import { useReactToPrint } from 'react-to-print';

import _ from "lodash";

const showSuccessToast = (message: string) => {
	toast.success(message, {
		duration: 3500,
		style: {
			border: "1px solid #86DC3D",
			padding: "16px",
			color: "#000000",
			textAlign: "justify",
		},
		iconTheme: {
			primary: "#86DC3D",
			secondary: "#FFFAEE",
		},
	});
};

const Document = ({ documents }: { documents?: string[] }) => {
	function convertToReadableName(url: string) {
		const split = url.split("supporting_documents/");
		const fileName = split[split.length - 1];
		const firstUnderscorePosition = fileName.indexOf("_");
		let readableName = fileName.substring(firstUnderscorePosition + 1);
		readableName = readableName.replaceAll("%20", " ");
		return readableName;
	}

	if (documents?.length === 0 || !documents) {
		return null;
	}

	return (
		<>
			{documents.map((data: string) => (
				<Link href={data} target="_blank" className="flex gap-2 p-2 items-start" key={data}>
					<BsFiletypePdf className="w-6 h-6 text-red-500" />
					{convertToReadableName(data)}
				</Link>
			))}
		</>
	);
};

let files: any[] = [];

export default function AdminExternalForm({ data }: { data: ExternalForm }) {
	const supabase = createClientComponentClient();
	const router = useRouter();
	const searchParams = useSearchParams();
	const secKey = searchParams.get("secKey");
	files = data.supporting_documents ?? [];

	const auth = getAuth();
	const user = auth.currentUser;

	const [revertOpen, setRevertOpen] = useState(false);
	const [submitOpen, setSubmitOpen] = useState(false);
	const [applicantOpen, setApplicantOpen] = useState(false);
	const [externalForm, setExternalForm] = useState<ExternalForm>(data);
	const [applicantImageURL, setApplicantImageURL] = useState(data.applicant_declaration_signature);
	const [verificationImageURL, setVerificationImageURL] = useState(data.verification_signature);
	const [approvalImageURL, setApprovalImageURL] = useState(data.approval_signature);

	const [showCommentInput, setShowCommentInput] = useState(false);

	const [authToken, setAuthToken] = useState<string | undefined>(auth.currentUser?.uid);
	const [verificationSignatureDialogOpen, setVerificationSignatureDialogOpen] = useState(false);
	const [approvalSignatureDialogOpen, setApprovalSignatureDialogOpen] = useState(false);

	let displayName: string | null = null;
	let email: string | null = null;

	if (user !== null) {
		displayName = user.displayName;
		email = user.email;
	}

	function convertToReadableName(url: string) {
		const split = url.split("supporting_documents/");
		const fileName = split[split.length - 1];
		const firstUnderscorePosition = fileName.indexOf("_");
		let readableName = fileName.substring(firstUnderscorePosition + 1);
		readableName = readableName.replaceAll("%20", " ");
		return readableName;
	}

	const [securityKeyError, setSecurityKeyError] = useState(false);

	const applicantSigCanvas = useRef({});
	const applicantSigClear = (field: FieldValues) => {
		//@ts-ignore
		applicantSigCanvas.current.clear();
		setApplicantImageURL(null);
		field.onChange("");
		field.value = "";
	};

	const verificationSigCanvas = useRef({});
	const verificationSigClear = (field: FieldValues) => {
		//@ts-ignore
		verificationSigCanvas.current.clear();
		setVerificationImageURL(null);
		field.onChange("");
		field.value = "";
	};

	const approvalSigCanvas = useRef({});
	const approvalSigClear = (field: FieldValues) => {
		//@ts-ignore
		approvalSigCanvas.current.clear();
		setApprovalImageURL(null);
		field.onChange("");
		field.value = "";
	};

	const [verificationDate, setVerificationDate] = useState<Date | null>(
		externalForm.verification_date ? new Date(externalForm.verification_date) : null,
	);
	const [approvalDate, setApprovalDate] = useState<Date | null>(externalForm.approval_date ? new Date(externalForm.approval_date) : null);
	const [emails, setEmails] = useState<any[]>([]);

	const contentRef = useRef<HTMLDivElement>(null);
	const reactToPrintFn = useReactToPrint({ contentRef });

	const form = useForm<z.infer<typeof adminExternalFormSchema>>({
		resolver: zodResolver(adminExternalFormSchema),
		defaultValues: {
			revertComment: externalForm.revertComment ?? "",
			formStage: externalForm.formStage!,
			securityKey: secKey ?? "",
			verification_email: externalForm.verification_email!,
			approval_email: externalForm.approval_email!,

			full_name: externalForm.full_name!,
			email: externalForm.email!,
			staff_id: externalForm.staff_id!,
			course: externalForm.course!,
			faculty: externalForm.faculty!,
			transport: externalForm.transport!,
			travelling: externalForm.travelling!,
			other_members: externalForm.other_members!,

			program_title: externalForm.program_title!,
			program_description: externalForm.program_description!,
			commencement_date: new Date(externalForm.commencement_date!),
			completion_date: new Date(externalForm.completion_date!),
			organiser: externalForm.organiser!,
			venue: externalForm.venue!,
			hrdf_claimable: externalForm.hrdf_claimable!,
			total_hours: externalForm.total_hours ?? null,

			// @ts-ignore
			logistic_arrangement: externalForm.logistic_arrangement,

			course_fee: externalForm.course_fee!,
			airfare_fee: externalForm.airfare_fee!,
			accommodation_fee: externalForm.accommodation_fee!,
			per_diem_fee: externalForm.per_diem_fee!,
			transportation_fee: externalForm.transportation_fee!,
			travel_insurance_fee: externalForm.travel_insurance_fee!,
			other_fees: externalForm.other_fees!,
			grand_total_fees: externalForm.grand_total_fees!,
			staff_development_fund: externalForm.staff_development_fund!,
			consolidated_pool_fund: externalForm.consolidated_pool_fund!,
			research_fund: externalForm.research_fund!,
			travel_fund: externalForm.travel_fund!,
			student_council_fund: externalForm.student_council_fund!,
			other_funds: externalForm.other_funds!,
			expenditure_cap: externalForm.expenditure_cap!,
			expenditure_cap_amount: externalForm.expenditure_cap_amount!,

			supporting_documents: externalForm.supporting_documents ?? null,

			applicant_declaration_signature: externalForm.applicant_declaration_signature!,
			applicant_declaration_name: externalForm.applicant_declaration_name!,
			applicant_declaration_position_title: externalForm.applicant_declaration_position_title!,
			applicant_declaration_date: new Date(externalForm.applicant_declaration_date!),

			verification_signature: externalForm.verification_signature ?? "",
			verification_name: externalForm.verification_name ?? "",
			verification_position_title: externalForm.verification_position_title ?? "",
			verification_date: verificationDate,

			approval_signature: externalForm.approval_signature ?? "",
			approval_name: externalForm.approval_name ?? "",
			approval_position_title: externalForm.approval_position_title ?? "",
			approval_date: approvalDate,
		},
	});

	useEffect(() => {
		if (externalForm.formStage === 3) {
			if (externalForm.verification_date === null || externalForm.verification_date === undefined) {
				form.setValue("verification_date", new Date());
				setVerificationDate(new Date());
			}
		}

		if (externalForm.formStage === 4) {
			if (externalForm.approval_date === null || externalForm.approval_date === undefined) {
				form.setValue("approval_date", new Date());
				setApprovalDate(new Date());
			}
		}
	}, [externalForm.verification_date, externalForm.approval_date, externalForm.formStage, form]);


	useEffect(() => {
		const fetchEmails = async () => {
			const { data, error } = await supabase
				.from("external_emails")
				.select("*");

			if (error) {
				return;
			}

			setEmails(data || []);
		};

		fetchEmails();
	}, [supabase])

	const checkFormStatus = () => {
		setApplicantOpen(false);
		if (form.getValues("completion_date") < form.getValues("commencement_date")) {
			toast.error("Commencement date must be before completion date.");
		}
		if (form.getValues("travelling") === "group" && form.getValues("other_members") === "") {
			toast.error("Please enter the name of other members traveling together");
		}
		if (externalForm.formStage === 3) {
			if (
				form.getValues("verification_name") === "" ||
				form.getValues("verification_position_title") === "" ||
				form.getValues("verification_signature") === "" ||
				form.getValues("verification_signature") === null ||
				form.getValues("verification_date") === undefined
			) {
				toast.error("Please fill in all the required verification fields");
			}
		}

		if (externalForm.formStage === 4) {
			if (
				form.getValues("approval_name") === "" ||
				form.getValues("approval_position_title") === "" ||
				form.getValues("approval_signature") === "" ||
				form.getValues("approval_signature") === null ||
				form.getValues("approval_date") === undefined
			) {
				toast.error("Please fill in all the required approval fields");
			}
		}
	};

	// Enable this for debugging purposes only
	// useEffect(() => {
	// 	console.log(form.formState.errors);
	// }, [form.formState.errors]);

	async function onSubmit(values: z.infer<typeof adminExternalFormSchema>) {
		// if (values.securityKey != externalForm.securityKey) {
		// 	toast.error("Invalid security key!");
		// 	return;
		// }

		const securityKeyUID = uuidv4();

		// This part is for submission for review from AAO to HOS/ MGR/ ADCR, Stage 2 -> Stage 3,
		if (externalForm.formStage === 2) {
			if (values.verification_email === "" || !values.verification_email) {
				toast.error("Please select a verification email.");
				return;
			}

			if (values.approval_email === "" || !values.approval_email) {
				toast.error("Please select an approval email.");
				return;
			}

			const { data, error } = await supabase
				.from("external_forms")
				.update([
					{
						expenditure_cap: externalForm.expenditure_cap,
						expenditure_cap_amount: externalForm.expenditure_cap_amount,
						revertComment: "None",
						securityKey: securityKeyUID,
						formStage: 3,
						verification_email: values.verification_email,
						approval_email: values.approval_email,
						total_hours: values.total_hours,
						last_updated: new Date(),
					},
				])
				.eq("id", externalForm.id);

			if (error) {
				toast.error("Error submitting form");
			} else {
				await supabase.from("audit_log").insert([
					{
						ntf_id: externalForm.id,
						type: "Review",
						username: displayName,
						email: email,
					},
				]);
				fetchAndUpdateFormData(externalForm.id, "to_3");
			}
		}
		// This part is when the staff re-submits the form to the AAO after being reverted,
		else if (externalForm.formStage === 1) {
			if (values.securityKey != externalForm.securityKey) {
				toast.error("Invalid security key!");
				return;
			}

			let documentPaths: string[] = [];
			const uniqueName = uuidv4();
			if (values.supporting_documents && values.supporting_documents.length > 0) {
				for (const file of values.supporting_documents) {
					if (file instanceof File) {
						const upload = await supabase.storage.from("supporting_documents").upload(`${uniqueName}_${file.name}`, file, {
							cacheControl: "3600",
							upsert: false,
						});

						if (upload.data) {
							const { data } = supabase.storage.from("supporting_documents").getPublicUrl(upload?.data.path);

							if (data) {
								documentPaths.push(data.publicUrl);
							}
						}

						if (upload.error) {
							console.log(upload.error);
						}
					}
				}
			}

			//  merge the files to the documentPath, first is files, second is the new files, but only the path not the file
			let mergedFilesPath = [];
			for (let i = 0; i < files.length; i++) {
				if (_.isString(files[i])) {
					mergedFilesPath.push(files[i]);
				}
			}
			mergedFilesPath = mergedFilesPath.concat(documentPaths);

			console.log("Updating...");
			const { error } = await supabase
				.from("external_forms")
				.update([
					{
						...values,
						formStage: 2,
						securityKey: null,
						last_updated: new Date(),
						supporting_documents: mergedFilesPath,
					},
				])
				.eq("id", externalForm.id);

			if (error) {
				console.error(error);
				toast.error("Error submitting form");
			} else {
				await supabase.from("audit_log").insert([
					{
						ntf_id: externalForm.id,
						type: "Resubmit",
						username: values.full_name,
						email: values.email,
					},
				]);
				fetchAndUpdateFormData(externalForm.id, "to_2");
			}
		}

		// This is for submitting the forms for further review to HMU/ Dean BY HOS/ MGR/ ADCR, Stage 3 -> Stage 4,
		else if (externalForm.formStage === 3) {
			console.log(values.verification_signature);

			if (values.verification_signature instanceof File) {
				const newUniqueName = uuidv4();
				const upload = await supabase.storage
					.from("signatures")
					.upload(`${newUniqueName}_signature.png`, values.verification_signature, {
						cacheControl: "3600",
						upsert: false,
					});

				if (upload.data) {
					const { data } = supabase.storage.from("signatures").getPublicUrl(upload?.data.path);

					if (data) {
						values.verification_signature = data.publicUrl;
					}
				}

				if (upload.error) {
					console.log(upload.error);
					toast.error("Error uploading signature");
				}
			}

			const { data, error } = await supabase
				.from("external_forms")
				.update([
					{
						formStage: 4,
						securityKey: securityKeyUID,

						verification_email: values.verification_email,
						verification_name: values.verification_name,
						verification_position_title: values.verification_position_title,
						verification_date: values.verification_date,
						verification_signature: values.verification_signature,

						approval_email: values.approval_email,
						approval_name: values.approval_name,
						approval_position_title: values.approval_position_title,
						approval_date: values.approval_date,
						approval_signature: values.approval_signature,
						last_updated: new Date(),
					},
				])
				.eq("id", externalForm.id);

			if (error) {
				// console.error("Error inserting data:", error);
			} else {
				await supabase.from("audit_log").insert([
					{
						ntf_id: externalForm.id,
						type: "Verified",
					},
				]);
				fetchAndUpdateFormData(externalForm.id, "to_4");
			}
		}

		// This is for approving the forms by HMU/ Dean, Stage 4 -> Stage 5,
		else if (externalForm.formStage === 4) {
			if (values.approval_signature instanceof File) {
				const newUniqueName = uuidv4();
				const upload = await supabase.storage
					.from("signatures")
					.upload(`${newUniqueName}_signature.png`, values.approval_signature, {
						cacheControl: "3600",
						upsert: false,
					});

				if (upload.data) {
					const { data } = supabase.storage.from("signatures").getPublicUrl(upload?.data.path);

					if (data) {
						values.approval_signature = data.publicUrl;
					}
				}

				if (upload.error) {
					console.log(upload.error);
					toast.error("Error uploading signature");
				}
			}

			const { data, error } = await supabase
				.from("external_forms")
				.update(
					{
						formStage: 5,
						securityKey: securityKeyUID,
						verification_email: values.verification_email,
						verification_name: values.verification_name,
						verification_position_title: values.verification_position_title,
						verification_date: values.verification_date,
						verification_signature: values.verification_signature,

						approval_email: values.approval_email,
						approval_name: values.approval_name,
						approval_position_title: values.approval_position_title,
						approval_date: values.approval_date,
						approval_signature: values.approval_signature,
						last_updated: new Date(),
					}
				)
				.eq("id", externalForm.id);

			if (error) {
				toast.error("Error submitting form");
				// console.error("Error inserting data:", error);
			} else {
				await supabase.from("audit_log").insert([
					{
						ntf_id: externalForm.id,
						type: "Approved",
					},
				]);
				fetchAndUpdateFormData(externalForm.id, "to_5");
			}
		}
	};

	const createNotifications = async (message: string, formId: string) => {
		const notifDesc = message;
		const notifType = "Nominations/ Travelling Form";
		const notifLink = `/form/external/${formId}`;

		const { data: notificationData, error: notificationError } = await supabase
			.from("notifications")
			.insert([
				{
					notifDesc,
					notifType,
					notifLink,
				},
			]);

		if (notificationError) {

		} else {

		}
	};

	const fetchAndUpdateFormData = async (formId: string, formStage: string) => {
		const { data: updatedData, error: updatedError } = await supabase
			.from("external_forms")
			.select("*")
			.eq("id", formId);

		if (updatedError) {
			// console.error("Error fetching updated data:", updatedError);
		} else {
			showSuccessToast("Submitting... Please do not close this tab until you are redirected to the confirmation page. TQ.");

			let message = "";

			if (formStage == "to_1") {
				message = `The Nominations/ Travelling Form for ${updatedData[0].program_title}, submitted by ${updatedData[0].full_name} (${updatedData[0].staff_id}) has been reverted back to the user with reason(s): ${updatedData[0].revertComment}`;
			} else if (formStage == "to_2") {
				message = `The Nominations/ Travelling Form for ${updatedData[0].program_title}, submitted by ${updatedData[0].full_name} (${updatedData[0].staff_id}) has been re-submitted by the user.`;
			} else if (formStage == "to_3") {
				message = `The Nominations/ Travelling Form for ${updatedData[0].program_title}, submitted by ${updatedData[0].full_name} (${updatedData[0].staff_id}) has been reviewed by AAO and submitted to HOS/ ADCR/ MGR.`;
			} else if (formStage == "to_4") {
				message = `The Nominations/ Travelling Form for ${updatedData[0].program_title}, submitted by ${updatedData[0].full_name} (${updatedData[0].staff_id}) has been reviewed by HOS/ ADCR/ MGR and submitted to HMU/ Dean.`;
			} else if (formStage == "to_5") {
				message = `The Nominations/ Travelling Form for ${updatedData[0].program_title}, submitted by ${updatedData[0].full_name} (${updatedData[0].staff_id}) has been approved.`;
			} else if (formStage == "to_6") {
				message = `The Nominations/ Travelling Form for ${updatedData[0].program_title}, submitted by ${updatedData[0].full_name} (${updatedData[0].staff_id}) has been rejected with reason(s): ${updatedData[0].revertComment}`;
			} else {
				showSuccessToast("Submitting... Please do not close this tab until you are redirected to the confirmation page. TQ.");

				let message = "";

				if (formStage == "to_1") {
					message = `The Nominations/ Travelling Form for ${updatedData[0].program_title}, submitted by ${updatedData[0].full_name} (${updatedData[0].staff_id}) has been reverted back to the user with reason(s): ${updatedData[0].revertComment}`;
				} else if (formStage == "to_2") {
					message = `The Nominations/ Travelling Form for ${updatedData[0].program_title}, submitted by ${updatedData[0].full_name} (${updatedData[0].staff_id}) has been re-submitted by the user.`;
				} else if (formStage == "to_3") {
					message = `The Nominations/ Travelling Form for ${updatedData[0].program_title}, submitted by ${updatedData[0].full_name} (${updatedData[0].staff_id}) has been reviewed by AAO and submitted to HOS/ ADCR/ MGR.`;
				} else if (formStage == "to_4") {
					message = `The Nominations/ Travelling Form for ${updatedData[0].program_title}, submitted by ${updatedData[0].full_name} (${updatedData[0].staff_id}) has been reviewed by HOS/ ADCR/ MGR and submitted to HMU/ Dean.`;
				} else if (formStage == "to_5") {
					message = `The Nominations/ Travelling Form for ${updatedData[0].program_title}, submitted by ${updatedData[0].full_name} (${updatedData[0].staff_id}) has been approved.`;
				} else if (formStage == "to_6") {
					message = `The Nominations/ Travelling Form for ${updatedData[0].program_title}, submitted by ${updatedData[0].full_name} (${updatedData[0].staff_id}) has been rejected with reason(s): ${updatedData[0].revertComment}`;
				} else {
					message = `Notifications error. Please contact the webmaster.`;
				}

				createNotifications(message, updatedData[0].id);

				sendContactForm(updatedData);

				const aao = updatedData[0].aao_email;
				router.push(`/external_status?mail=${aao}`);
			}

			createNotifications(message, updatedData[0].id);

			sendContactForm(updatedData);

			const aao = updatedData[0].aao_email;
			router.push(`/external_status?mail=${aao}`);
		}
	};

	const handleRevert = async (values: z.infer<typeof adminExternalFormSchema>) => {
		const securityKeyUID = uuidv4();

		// This is for rejecting the forms by HOS/ ADCR/ MGR, Stage 3 -> Stage 6,
		if (externalForm.formStage === 3) {
			const { data, error } = await supabase
				.from("external_forms")
				.update([
					{
						// TO-DO: CONFIRM IT WILL UPDATE CORRECTLY,
						formStage: 6,
						securityKey: securityKeyUID,
						// TO-DO: ADD IN HOS/ ADCR/ MGR DETAILS INTO THE DATABASE.
						revertComment: values.revertComment,
						verification_email: values.verification_email,
						verification_name: values.verification_name,
						verification_position_title: values.verification_position_title,
						verification_date: values.verification_date,
						verification_signature: values.verification_signature,

						approval_email: values.approval_email,
						approval_name: values.approval_name,
						approval_position_title: values.approval_position_title,
						approval_date: values.approval_date,
						approval_signature: values.approval_signature,
						last_updated: new Date(),
					},
				])
				.eq("id", externalForm.id);

			if (error) {
				console.error("Error updating data:", error);
			} else {
				await supabase.from("audit_log").insert([
					{
						ntf_id: externalForm.id,
						type: "Rejected at verification stage",
					},
				]);
				fetchAndUpdateFormData(externalForm.id, "to_6");
			}
		} else if (externalForm.formStage === 4) {
			const { data, error } = await supabase
				.from("external_forms")
				.update([
					{
						formStage: 6,
						securityKey: securityKeyUID,
						revertComment: values.revertComment,
						verification_email: values.verification_email,
						verification_name: values.verification_name,
						verification_position_title: values.verification_position_title,
						verification_date: values.verification_date,
						verification_signature: values.verification_signature,

						approval_email: values.approval_email,
						approval_name: values.approval_name,
						approval_position_title: values.approval_position_title,
						approval_date: values.approval_date,
						approval_signature: values.approval_signature,
						last_updated: new Date(),
					},
				])
				.eq("id", externalForm.id);

			if (error) {
				console.error(error);
			} else {
				await supabase.from("audit_log").insert([
					{
						ntf_id: externalForm.id,
						type: "Rejected at approval stage",
					},
				]);
				fetchAndUpdateFormData(externalForm.id, "to_6");
			}
		}

		// This is for the AAO to revert to the staff with the comments, Stage 2 -> Stage 1,
		if (externalForm.formStage === 2 && (showCommentInput == true || externalForm.revertComment != "None")) {
			console.log("Reverting");
			const { data, error } = await supabase
				.from("external_forms")
				.update([
					{
						expenditure_cap: values.expenditure_cap,
						expenditure_cap_amount: values.expenditure_cap_amount,
						revertComment: values.revertComment,
						securityKey: securityKeyUID,
						formStage: 1,
						verification_email: values.verification_email,
						approval_email: values.approval_email,
						total_hours: values.total_hours,
						last_updated: new Date(),
					},
				])
				.eq("id", externalForm.id);

			if (error) {
				console.error("Error updating data:", error);
			} else {
				fetchAndUpdateFormData(externalForm.id, "to_1");
			}
		} else if (showCommentInput == false) {
			setShowCommentInput(true);
		}
	};

	const [group, setGroup] = useState(true);

	const [selectedTab, setSelectedTab] = useState("View");

	const colFlightClass = "grid grid-cols-[150px_120px_120px_150px_150px_1fr_150px_150px]";
	const colHotelClass = "grid grid-cols-[1fr_200px_200px]";

	return (
		<div>
			<div className="space-x-2 space-y-2 flex flex-col items-center justify-center p-5 print-button">
				<div className="text-[16px] font-bold">NOTE: You may change the layout to Print Layout if you are required to print this document.</div>
				<div className="flex space-x-4">
					<Button
						onClick={() => setSelectedTab("View")}
						className={`transition ease-in-out duration-300 py-2 px-4 rounded-lg ${selectedTab === "View" ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
					>
						View (Default)
					</Button>
					<Button
						onClick={() => setSelectedTab("Print")}
						className={`transition ease-in-out duration-300 py-2 px-4 rounded-lg ${selectedTab === "Print" ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
					>
						Print Layout
					</Button>
				</div>
			</div>
			{/* 1. STAFF EMAIL (INPUT FIELD WITH EMAIL VALIDATION), 2. HOS/ MGR/ ADCR EMAIL (DROPDOWN SELECT), 3. HMU/ DEAN EMAIL (DROPDOWN SELECT) */}
			{selectedTab === "View" ? (
				<>
					{externalForm.formStage !== 5 && externalForm.formStage !== 6 && externalForm.formStage !== 7 ? (
						<div className="mx-auto max-w-6xl px-8 my-8 mt-6 mb-[200px]">
							<div className="ml-10">
								<div className="flex ml-[13px]">
									<div>
										<Image src="/swinburne_logo.png" alt="" width={200} height={300} />
									</div>
									<div className="ml-8 mt-2">
										<p className="font-medium">Human Resources</p>
										<h1 className="text-3xl font-bold text-slate-800 mb-4 mt-4 -ml-[1px]">Nomination / Travelling Application Form</h1>
									</div>
								</div>

								<div className="mb-4 text-slate-800 mt-2">
									<p className="mb-2">
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">*</span>
										<span>
											Before completing this form, please refer to the separate document on “General Instructions for completing
											Nomination / Travelling Application Form”, which is available on SharePoint.
										</span>
									</p>
									<p className="mb-2">
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">*</span>
										<span>All fields are mandatory to complete as required for each applicable section.</span>
									</p>
									<p>
										<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">*</span>
										<span>
											This form is also to be used for any contracted individual as consultant, and is to be completed where applicable.
										</span>
									</p>
								</div>
							</div>
							<hr className="mt-8" />
							<div className="grid gap-8 place-items-center">
								<Form {...form}>
									<form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-8 max-w-4xl">
										{(externalForm.revertComment != "None" && externalForm.revertComment != "" && externalForm.formStage == 1) && (
											<FormField
												control={form.control}
												name="revertComment"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-red-500">Comments</FormLabel>
														<FormControl>
															<Textarea
																disabled={externalForm.formStage == 1}
																className="disabled:text-black-500 disabled:opacity-100"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										)}

										<section className="section-1" id="Personal Details">
											<h2 className="text-2xl font-bold mb-4">1. Personal Details</h2>
											<div className="grid gap-8">
												<FormField
													control={form.control}
													name="email"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Email <span className="text-red-500"> *</span></FormLabel>
															<FormControl>
																<Input
																	disabled={externalForm.formStage != 1}
																	className="disabled:text-black-500 disabled:opacity-100"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<div className="grid grid-auto-fit-lg gap-8">
													<FormField
														control={form.control}
														name="full_name"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Full Name (Same as I.C / Passport) <span className="text-red-500"> *</span></FormLabel>
																<FormControl>
																	<Input
																		disabled={externalForm.formStage != 1}
																		className="disabled:text-black-500 disabled:opacity-100"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name="staff_id"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Staff ID / Student No. <span className="text-red-500"> *</span></FormLabel>
																<FormControl>
																	<Input
																		disabled={externalForm.formStage != 1}
																		className="disabled:text-black-500 disabled:opacity-100"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name="course"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Designation / Course <span className="text-red-500"> *</span></FormLabel>
																<FormControl>
																	<Input
																		disabled={externalForm.formStage != 1}
																		className="disabled:text-black-500 disabled:opacity-100"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name="faculty"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Faculty / School / Unit <span className="text-red-500"> *</span></FormLabel>
																<FormControl>
																	<Input
																		disabled={externalForm.formStage != 1}
																		className="disabled:text-black-500 disabled:opacity-100"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name="transport"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Type of Transportation <span className="text-red-500"> *</span></FormLabel>
																<Select
																	disabled={externalForm.formStage != 1}
																	onValueChange={field.onChange}
																	defaultValue={field.value}>
																	<FormControl>
																		<SelectTrigger className="disabled:opacity-100">
																			<SelectValue placeholder="Please select an option" />
																		</SelectTrigger>
																	</FormControl>
																	<SelectContent>
																		<SelectItem value="aeroplane">Aeroplane</SelectItem>
																		<SelectItem value="company vehicle">Company vehicle</SelectItem>
																		<SelectItem value="own transport">Own transport</SelectItem>
																	</SelectContent>
																</Select>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name="travelling"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Traveling in <span className="text-red-500"> *</span></FormLabel>
																<Select
																	disabled={externalForm.formStage != 1}
																	onValueChange={e => {
																		field.onChange(e);
																		if (e === "group") {
																			setGroup(false);
																		} else {
																			setGroup(true);
																		}
																	}}
																	defaultValue={field.value}>
																	<FormControl>
																		<SelectTrigger className="disabled:opacity-100">
																			<SelectValue placeholder="Please select an option" />
																		</SelectTrigger>
																	</FormControl>
																	<SelectContent>
																		<SelectItem value="alone">Alone</SelectItem>
																		<SelectItem value="group">Group</SelectItem>
																	</SelectContent>
																</Select>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
												{form.getValues("travelling") === "group" && (
													<FormField
														control={form.control}
														name="other_members"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Name of other staff / student traveling together in group <span className="text-red-500"> *</span></FormLabel>
																<FormControl>
																	<Input className="disabled:text-black-500 disabled:opacity-100" {...field} />
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												)}
											</div>
										</section>

										<Separator className="my-8" />

										<section className="section-2" id="Travel Details<">
											<h2 className="text-2xl font-bold mb-4">2. Travel Details</h2>
											<div className="grid grid-auto-fit-lg gap-8">
												<FormField
													control={form.control}
													name="program_title"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Program title / Event <span className="text-red-500"> *</span></FormLabel>
															<FormControl>
																<Input
																	disabled={externalForm.formStage != 1}
																	className="disabled:text-black-500 disabled:opacity-100"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="program_description"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Description <span className="text-red-500"> *</span></FormLabel>
															<FormControl>
																<Textarea
																	disabled={externalForm.formStage != 1}
																	className="disabled:text-black-500 disabled:opacity-100"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="commencement_date"
													render={({ field }) => (
														<FormItem className="flex flex-col">
															<FormLabel>Commencement Date <span className="text-red-500"> *</span></FormLabel>
															<Popover>
																<PopoverTrigger asChild>
																	<FormControl>
																		<Button
																			disabled={externalForm.formStage != 1}
																			variant={"outline"}
																			className={cn(
																				"w-full pl-3 text-left font-normal disabled:opacity-100",
																				!field.value && "text-muted-foreground",
																			)}>
																			{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
																		</Button>
																	</FormControl>
																</PopoverTrigger>
																<PopoverContent className="w-auto p-0" align="start">
																	<Calendar
																		mode="single"
																		selected={field.value}
																		onSelect={date => {
																			if (date !== undefined) {
																				date.setHours(date.getHours() + 8);
																				field.onChange(date);
																				field.value = date;
																			}
																		}}
																		disabled={date => {
																			const today = new Date();
																			return date < today;
																		}}
																		initialFocus
																	/>
																</PopoverContent>
															</Popover>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="completion_date"
													render={({ field }) => (
														<FormItem className="flex flex-col">
															<FormLabel>Completion Date <span className="text-red-500"> *</span></FormLabel>
															<Popover>
																<PopoverTrigger asChild>
																	<FormControl>
																		<Button
																			disabled={externalForm.formStage != 1}
																			variant={"outline"}
																			className={cn(
																				"w-full pl-3 text-left font-normal disabled:opacity-100",
																				!field.value && "text-muted-foreground",
																			)}>
																			{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
																		</Button>
																	</FormControl>
																</PopoverTrigger>
																<PopoverContent className="w-auto p-0" align="start">
																	<Calendar
																		mode="single"
																		selected={field.value}
																		onSelect={date => {
																			field.onChange(date);
																			if (date !== undefined) {
																				date.setHours(date.getHours() + 8);
																				field.value = new Date(date);
																			}
																		}}
																		disabled={date => {
																			const today = new Date();
																			return date < today;
																		}}
																		initialFocus
																	/>
																</PopoverContent>
															</Popover>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="organiser"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Organiser <span className="text-red-500"> *</span></FormLabel>
															<FormControl>
																<Input
																	disabled={externalForm.formStage != 1}
																	className="disabled:text-black-500 disabled:opacity-100"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												{externalForm.formStage === 2 && (
													<FormField
														control={form.control}
														name="total_hours"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Total Hours</FormLabel>
																<FormControl>
																	<Input
																		disabled={externalForm.formStage != 2}
																		className="disabled:text-black-500 disabled:opacity-100"
																		{...field}
																		onChange={(e) => {
																			field.onChange(e);
																			if (e.target.value === "") {
																				field.onChange(0);
																			} else {
																				field.onChange(parseInt(e.target.value));
																			}
																		}
																		}
																		value={field.value || ""}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												)}
												<FormField
													control={form.control}
													name="venue"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Venue <span className="text-red-500"> *</span></FormLabel>
															<FormControl>
																<Input
																	disabled={externalForm.formStage != 1}
																	className="disabled:text-black-500 disabled:opacity-100"
																	{...field}
																	value={field.value || ""}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="hrdf_claimable"
													render={({ field }) => (
														<FormItem>
															<FormLabel>HDRF Claimable <span className="text-red-500"> *</span></FormLabel>
															<Select
																disabled={externalForm.formStage != 1}
																onValueChange={field.onChange}
																defaultValue={field.value}>
																<FormControl>
																	<SelectTrigger className="disabled:opacity-100">
																		<SelectValue placeholder="Please select an option" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value="yes">Yes</SelectItem>
																	<SelectItem value="no">No</SelectItem>
																	<SelectItem value="not indicated in event brochure / registration form">
																		Not indicated in event brochure / registration form
																	</SelectItem>
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
										</section>

										<Separator className="my-8" />

										<section className="section-3" id="Logistic Arrangement">
											<h2 className="text-2xl font-bold mb-4">3. Logistic Arrangement</h2>
											<div className="grid">
												{form.getValues("transport") === "aeroplane" && form.getValues("logistic_arrangement") ? (
													<>
														<div className={colFlightClass + " p-3 pl-5 bg-amber-50 rounded-xl mb-6 [&>*]:mx-3"}>
															<div>
																Flight Date <span className="text-red-500"> *</span>
															</div>
															<div>
																Flight Time <span className="text-red-500"> *</span>
															</div>
															<div>
																Flight No. <span className="text-red-500"> *</span>
															</div>
															<div>
																From <span className="text-red-500"> *</span>
															</div>
															<div>
																To <span className="text-red-500"> *</span>
															</div>
															<div>Hotel Name</div>
															<div>Check In</div>
															<div>Check Out</div>
														</div>
														<div className="rounded-xl shadow-[0_0_0_2px_#EFEFEF_inset] p-2 divide-y-2 divide-solid divide-[#EFEFEF]">
															{[...Array(form.watch("logistic_arrangement")?.length)].map((_, i) => (
																<div key={i} className={colFlightClass + " divide-x-2 divide-solid divide-[#EFEFEF] [&>*]:my-2 " + i}>
																	<FormField
																		control={form.control}
																		name="logistic_arrangement"
																		render={({ field }) => (
																			<FormItem>
																				<Popover>
																					<PopoverTrigger asChild>
																						<FormControl>
																							<Button
																								variant={"outline"}
																								className={cn("w-full text-left font-normal border-none")}
																							>
																								{field.value &&
																									field.value[i] &&
																									field.value[i].flight_date ? (
																									format(new Date(field.value[i].flight_date!), "PPP")
																								) : (
																									<span>Pick a date</span>
																								)}
																							</Button>
																						</FormControl>
																					</PopoverTrigger>
																					<PopoverContent className="w-auto p-0" align="start">
																						<Calendar
																							mode="single"
																							selected={field.value?.[i]?.flight_date!}
																							onSelect={date => {
																								if (date !== undefined) {
																									date.setHours(date.getHours() + 8);
																									field.onChange(
																										field.value?.map((item, index) =>
																											index === i ? { ...item, flight_date: date } : item,
																										),
																									);
																								}
																							}}
																							disabled={date => {
																								const today = new Date();
																								today.setHours(0, 0, 0, 0);
																								return date < today;
																							}}
																							initialFocus
																						/>
																					</PopoverContent>
																				</Popover>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>
																	<FormField
																		control={form.control}
																		name="logistic_arrangement"
																		render={({ field }) => (
																			<FormItem>
																				<FormControl>
																					<Input
																						className="border-none shadow-none focus:shadow-none focus:ring-transparent focus:border-none"
																						type="time"
																						value={field.value?.[i]?.flight_time || ""}
																						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																							const newValue = field.value?.map((item, index) =>
																								index === i ? { ...item, flight_time: e.target.value } : item,
																							);
																							field.onChange(newValue);
																						}}
																					/>
																				</FormControl>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>
																	<FormField
																		control={form.control}
																		name="logistic_arrangement"
																		render={({ field }) => (
																			<FormItem>
																				<FormControl>
																					<Input
																						className="border-none focus:ring-transparent shadow-none"
																						value={field.value?.[i]?.flight_number || ""}
																						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																							const newValue = field.value?.map((item, index) =>
																								index === i ? { ...item, flight_number: e.target.value } : item,
																							);
																							field.onChange(newValue);
																						}}
																					/>
																				</FormControl>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>
																	<FormField
																		control={form.control}
																		name="logistic_arrangement"
																		render={({ field }) => (
																			<FormItem>
																				<FormControl>
																					<Input
																						className="border-none focus:ring-transparent shadow-none"
																						value={field.value?.[i]?.destination_from || ""}
																						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																							const newValue = field.value?.map((item, index) =>
																								index === i ? { ...item, destination_from: e.target.value } : item,
																							);
																							field.onChange(newValue);
																						}}
																					/>
																				</FormControl>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>
																	<FormField
																		control={form.control}
																		name="logistic_arrangement"
																		render={({ field }) => (
																			<FormItem>
																				<FormControl>
																					<Input
																						className="border-none focus:ring-transparent shadow-none"
																						value={field.value?.[i]?.destination_to || ""}
																						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																							const newValue = field.value?.map((item, index) =>
																								index === i ? { ...item, destination_to: e.target.value } : item,
																							);
																							field.onChange(newValue);
																						}}
																					/>
																				</FormControl>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>

																	<FormField
																		control={form.control}
																		name="logistic_arrangement"
																		render={({ field }) => (
																			<FormItem>
																				<FormControl>
																					<Input
																						className="border-none focus:ring-transparent shadow-none"
																						value={field.value?.[i]?.hotel_name || ""}
																						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																							const newValue = field.value?.map((item, index) =>
																								index === i ? { ...item, hotel_name: e.target.value } : item,
																							);
																							field.onChange(newValue);
																						}}
																					/>
																				</FormControl>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>

																	<FormField
																		control={form.control}
																		name="logistic_arrangement"
																		render={({ field }) => (
																			<FormItem>
																				<Popover>
																					<PopoverTrigger asChild>
																						<FormControl>
																							<Button
																								variant={"outline"}
																								className={cn(
																									"w-full text-left font-normal rounded-none border-none pl-2",
																									!field.value && "text-muted-foreground",
																								)}
																							>
																								{field.value &&
																									field.value[i] &&
																									field.value[i].check_in_date ? (
																									format(new Date(field.value?.[i].check_in_date!), "PPP")
																								) : (
																									<span>Pick a date</span>
																								)}
																							</Button>
																						</FormControl>
																					</PopoverTrigger>
																					<PopoverContent className="w-auto p-0" align="start">
																						<Calendar
																							mode="single"
																							selected={
																								field.value && field.value[i]
																									? (field.value[i].check_in_date as Date)
																									: undefined
																							}
																							onSelect={date => {
																								if (date !== undefined) {
																									date.setHours(date.getHours() + 8);
																									field.onChange(
																										field.value?.map((item, index) =>
																											index === i ? { ...item, check_in_date: date } : item,
																										),
																									);
																								}
																							}}
																							disabled={date => {
																								const today = new Date();
																								today.setHours(0, 0, 0, 0);
																								return date < today;
																							}}
																							initialFocus
																						/>
																					</PopoverContent>
																				</Popover>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>
																	<FormField
																		control={form.control}
																		name="logistic_arrangement"
																		render={({ field }) => (
																			<FormItem>
																				<Popover>
																					<PopoverTrigger asChild>
																						<FormControl>
																							<Button
																								variant={"outline"}
																								className={cn(
																									"w-full text-left font-normal rounded-none border-none pl-2",
																								)}
																							>
																								{field.value &&
																									field.value[i] &&
																									field.value[i].check_out_date ? (
																									format(new Date(field.value?.[i].check_out_date!), "PPP")
																								) : (
																									<span>Pick a date</span>
																								)}
																							</Button>
																						</FormControl>
																					</PopoverTrigger>
																					<PopoverContent className="w-auto p-0" align="start">
																						<Calendar
																							mode="single"
																							selected={
																								field.value &&
																									field.value[i] &&
																									field.value[i].check_out_date !== null &&
																									field.value[i].check_out_date
																									? (field.value[i].check_out_date as Date)
																									: undefined
																							}
																							onSelect={date => {
																								if (date !== undefined) {
																									date.setHours(date.getHours() + 8);
																									field.onChange(
																										field.value?.map((item, index) =>
																											index === i ? { ...item, check_out_date: date } : item,
																										),
																									);
																								}
																							}}
																							disabled={date => {
																								let today = form.getValues("logistic_arrangement")?.[i].check_out_date;
																								if (today === undefined) {
																									today = new Date();
																									today.setHours(0, 0, 0, 0);
																								} else {
																									today?.setHours(0, 0, 0, 0);
																								}
																								return date < today!;
																							}}
																							initialFocus
																						/>
																					</PopoverContent>
																				</Popover>
																				<FormMessage />
																			</FormItem>
																		)}
																	/>
																</div>
															))}
														</div>
													</>
												) : (
													<>
														{form.getValues("logistic_arrangement") && form.getValues("logistic_arrangement")?.length! > 0 ? (
															<>
																<div className={colHotelClass + " p-3 pl-5 bg-amber-50 rounded-xl mb-6 [&>*]:mx-3"}>
																	<div>Hotel Name</div>
																	<div>Check In</div>
																	<div>Check Out</div>
																</div>
																<div className="rounded-xl shadow-[0_0_0_2px_#EFEFEF_inset] p-2 divide-y-2 divide-solid divide-[#EFEFEF]">
																	{[...Array(form.watch("logistic_arrangement")?.length)].map((_, i) => (
																		<div
																			key={i}
																			className={colHotelClass + " divide-x-2 divide-solid divide-[#EFEFEF] [&>*]:my-2 " + i}
																		>
																			<FormField
																				control={form.control}
																				name="logistic_arrangement"
																				render={({ field }) => (
																					<FormItem>
																						<FormControl>
																							<Input
																								placeholder="Hotel Name"
																								className="border-none focus:ring-transparent shadow-none"
																								value={field.value?.[i]?.hotel_name || ""}
																								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																									const newValue = field.value?.map((item, index) =>
																										index === i ? { ...item, hotel_name: e.target.value } : item,
																									);
																									field.onChange(newValue);
																								}}
																							/>
																						</FormControl>
																						<FormMessage />
																					</FormItem>
																				)}
																			/>

																			<FormField
																				control={form.control}
																				name="logistic_arrangement"
																				render={({ field }) => (
																					<FormItem>
																						<Popover>
																							<PopoverTrigger asChild>
																								<FormControl>
																									<Button
																										variant={"outline"}
																										className={cn(
																											"w-full text-left font-normal rounded-none border-none pl-2",
																											!field.value && "text-muted-foreground",
																										)}
																									>
																										{field.value &&
																											field.value[i] &&
																											field.value[i].check_in_date ? (
																											format(new Date(field.value?.[i].check_in_date!), "PPP")
																										) : (
																											<span>Pick a date</span>
																										)}
																									</Button>
																								</FormControl>
																							</PopoverTrigger>
																							<PopoverContent className="w-auto p-0" align="start">
																								<Calendar
																									mode="single"
																									selected={
																										field.value && field.value[i]
																											? (field.value[i].check_in_date as Date)
																											: undefined
																									}
																									onSelect={date => {
																										if (date !== undefined) {
																											date.setHours(date.getHours() + 8);
																											field.onChange(
																												field.value?.map((item, index) =>
																													index === i ? { ...item, check_in_date: date } : item,
																												),
																											);
																										}
																									}}
																									disabled={date => {
																										const today = new Date();
																										today.setHours(0, 0, 0, 0);
																										return date < today;
																									}}
																									initialFocus
																								/>
																							</PopoverContent>
																						</Popover>
																						<FormMessage />
																					</FormItem>
																				)}
																			/>
																			<FormField
																				control={form.control}
																				name="logistic_arrangement"
																				render={({ field }) => (
																					<FormItem>
																						<Popover>
																							<PopoverTrigger asChild>
																								<FormControl>
																									<Button
																										variant={"outline"}
																										className={cn(
																											"w-full text-left font-normal rounded-none border-none pl-2",
																										)}
																									>
																										{field.value &&
																											field.value[i] &&
																											field.value[i].check_out_date ? (
																											format(new Date(field.value?.[i].check_out_date!), "PPP")
																										) : (
																											<span>Pick a date</span>
																										)}
																									</Button>
																								</FormControl>
																							</PopoverTrigger>
																							<PopoverContent className="w-auto p-0" align="start">
																								<Calendar
																									mode="single"
																									selected={
																										field.value &&
																											field.value[i] &&
																											field.value[i].check_out_date !== null &&
																											field.value[i].check_out_date
																											? (field.value[i].check_out_date as Date)
																											: undefined
																									}
																									onSelect={date => {
																										if (date !== undefined) {
																											date.setHours(date.getHours() + 8);
																											field.onChange(
																												field.value?.map((item, index) =>
																													index === i
																														? { ...item, check_out_date: date }
																														: item,
																												),
																											);
																										}
																									}}
																									disabled={date => {
																										let today = form.getValues("logistic_arrangement")?.[i]
																											.check_out_date;
																										if (today === undefined) {
																											today = new Date();
																											today.setHours(0, 0, 0, 0);
																										} else {
																											today?.setHours(0, 0, 0, 0);
																										}
																										return date < today!;
																									}}
																									initialFocus
																								/>
																							</PopoverContent>
																						</Popover>
																						<FormMessage />
																					</FormItem>
																				)}
																			/>
																		</div>
																	))}
																</div>
															</>
														) : (
															<div className="text-center text-muted-foreground w-full h-48 rounded-xl grid place-items-center bg-gray-100">
																No logistic arrangement added
															</div>
														)}
													</>
												)}
											</div>
										</section>

										<Separator className="my-8" />

										<section className="section-4" id="Funding">
											<h2 className="text-2xl font-bold mb-4">4. Funding</h2>
											<div className="grid grid-auto-fit-lg gap-8">
												<FormField
													control={form.control}
													name="course_fee"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Course Fee</FormLabel>
															<FormControl>
																<Input
																	disabled={externalForm.formStage != 1}
																	className="disabled:text-black-500 disabled:opacity-100"
																	{...field}
																	onChange={e => {
																		field.onChange(Number(e.target.value));
																	}}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													name="airfare_fee"
													control={form.control}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Airfare Fee</FormLabel>
															<FormControl>
																<Input
																	disabled={externalForm.formStage != 1}
																	className="disabled:text-black-500 disabled:opacity-100"
																	{...field}
																	onChange={e => {
																		field.onChange(Number(e.target.value));
																	}}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													name="accommodation_fee"
													control={form.control}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Accommodation Fee</FormLabel>
															<FormControl>
																<Input
																	disabled={externalForm.formStage != 1}
																	className="disabled:text-black-500 disabled:opacity-100"
																	{...field}
																	onChange={e => {
																		field.onChange(Number(e.target.value));
																	}}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													name="per_diem_fee"
													control={form.control}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Per Diem Fee</FormLabel>
															<FormControl>
																<Input
																	disabled={externalForm.formStage != 1}
																	className="disabled:text-black-500 disabled:opacity-100"
																	{...field}
																	onChange={e => {
																		field.onChange(Number(e.target.value));
																	}}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													name="transportation_fee"
													control={form.control}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Transportation Fee</FormLabel>
															<FormControl>
																<Input
																	disabled={externalForm.formStage != 1}
																	className="disabled:text-black-500 disabled:opacity-100"
																	{...field}
																	onChange={e => {
																		field.onChange(Number(e.target.value));
																	}}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													name="travel_insurance_fee"
													control={form.control}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Travel Insurance Fee</FormLabel>
															<FormControl>
																<Input
																	disabled={externalForm.formStage != 1}
																	className="disabled:text-black-500 disabled:opacity-100"
																	{...field}
																	onChange={e => {
																		field.onChange(Number(e.target.value));
																	}}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													name="other_fees"
													control={form.control}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Other Fee</FormLabel>
															<FormControl>
																<Input
																	disabled={externalForm.formStage != 1}
																	className="disabled:text-black-500 disabled:opacity-100"
																	{...field}
																	onChange={e => {
																		field.onChange(Number(e.target.value));
																	}}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													name="grand_total_fees"
													control={form.control}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Total Fee</FormLabel>
															<FormControl>
																<Input
																	disabled
																	value={
																		form.getValues("course_fee") +
																		form.getValues("airfare_fee") +
																		form.getValues("accommodation_fee") +
																		form.getValues("per_diem_fee") +
																		form.getValues("transportation_fee") +
																		form.getValues("travel_insurance_fee") +
																		form.getValues("other_fees")
																	}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

											<div className="mt-8">
												<h2 className="font-medium mb-3">
													Source of Fund -
													<span className="text-gray-500 text-sm">
														Details of account(s) to be debited. (It is encouraged to have a single source of funding)
													</span>
												</h2>
												<div className="grid grid-auto-fit-lg gap-8">
													<FormField
														name="staff_development_fund"
														control={form.control}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Staff Development Fund</FormLabel>
																<FormControl>
																	<Input
																		disabled={externalForm.formStage != 1}
																		className="disabled:text-black-500 disabled:opacity-100"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														name="consolidated_pool_fund"
														control={form.control}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Consolidated Pool Fund</FormLabel>
																<FormControl>
																	<Input
																		disabled={externalForm.formStage != 1}
																		className="disabled:text-black-500 disabled:opacity-100"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														name="research_fund"
														control={form.control}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Research Fund</FormLabel>
																<FormControl>
																	<Input
																		disabled={externalForm.formStage != 1}
																		className="disabled:text-black-500 disabled:opacity-100"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														name="travel_fund"
														control={form.control}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Travel Fund</FormLabel>
																<FormControl>
																	<Input
																		disabled={externalForm.formStage != 1}
																		className="disabled:text-black-500 disabled:opacity-100"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														name="student_council_fund"
														control={form.control}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Student Council Fund</FormLabel>
																<FormControl>
																	<Input
																		disabled={externalForm.formStage != 1}
																		className="disabled:text-black-500 disabled:opacity-100"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														name="other_funds"
														control={form.control}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Other Fund</FormLabel>
																<FormControl>
																	<Input
																		disabled={externalForm.formStage != 1}
																		className="disabled:text-black-500 disabled:opacity-100"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											</div>

											<div className="mt-8 space-y-4">
												<FormField
													control={form.control}
													name="expenditure_cap"
													render={({ field }) => (
														<FormItem className="space-y-3">
															<FormLabel>Any expenditure cap? If yes, please specify below, </FormLabel>
															<FormControl>
																<RadioGroup
																	disabled={externalForm.formStage !== 2 || !authToken}
																	onValueChange={field.onChange}
																	defaultValue={field.value}
																	className="flex space-x-1 disabled:text-gray-500">
																	<FormItem className="flex items-center space-x-3 space-y-0">
																		<FormControl>
																			<RadioGroupItem value="Yes" />
																		</FormControl>
																		<FormLabel
																			className={
																				"font-normal " +
																				(externalForm.formStage !== 2 || !authToken ? "text-gray-500" : "")
																			}>
																			Yes
																		</FormLabel>
																	</FormItem>
																	<FormItem className="flex items-center space-x-3 space-y-0">
																		<FormControl>
																			<RadioGroupItem value="No" />
																		</FormControl>
																		<FormLabel
																			className={
																				"font-normal " +
																				(externalForm.formStage !== 2 || !authToken ? "text-gray-500" : "")
																			}>
																			No
																		</FormLabel>
																	</FormItem>
																</RadioGroup>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="expenditure_cap_amount"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Expenditure Cap Amount</FormLabel>
															<FormControl>
																<Input
																	disabled={
																		form.getValues("expenditure_cap") !== "Yes" ||
																		(externalForm.formStage !== 2 && !authToken)
																	}
																	type="number"
																	{...field}
																	onChange={e => {
																		field.onChange(Number(e.target.value));
																	}}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
										</section>

										<Separator className="my-8" />

										<section className="section-5" id="Supporting Documents">
											<h1 className="text-2xl font-bold mb-4">5. Supporting Documents <span className="text-red-500"> *</span></h1>
											<FormField
												control={form.control}
												name="supporting_documents"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
															<div className="flex flex-col items-center justify-center pt-5 pb-6">
																<svg
																	className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
																	aria-hidden="true"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="none"
																	viewBox="0 0 20 16"
																>
																	<path
																		stroke="currentColor"
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth="2"
																		d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
																	/>
																</svg>
																<p className="mb-2 text-base text-gray-500 dark:text-gray-400">
																	<span className="font-semibold">Click or drag to upload</span>
																</p>
																<p className="text-sm text-gray-500 dark:text-gray-400">PDF (maximum 5MB)</p>
																{files.length > 0 && (
																	<p className="mt-2 text-xl text-slate-700">{files.length} File Uploaded</p>
																)}
															</div>
															<FormControl className="absolute">
																<Input
																	disabled={externalForm?.formStage! >= 3}
																	multiple
																	className="absolute w-full h-full opacity-0 cursor-pointer disabled:opacity-0"
																	type="file"
																	accept=".pdf"
																	{...form.register("supporting_documents", {
																		required: false,
																	})}
																	onChange={event => {
																		if (event.target.files) {
																			const newFiles = Array.from(event.target.files as FileList);
																			newFiles.forEach(newFile => {
																				if (!files.some(file => file.name === newFile.name)) {
																					files.push(newFile);
																				} else {
																					toast.error("File already exists");
																				}
																			});
																			field.onChange(files);
																			form.trigger("supporting_documents");
																			console.log(form.getValues("supporting_documents"));
																		}
																	}}
																/>
															</FormControl>
														</FormLabel>
														<FormMessage />
														<div className="grid gap-2 mt-2 items-start">
															{files &&
																Array.from(files).map((file: any, index: number) => (
																	<div key={file}>
																		{_.isString(file) ? (
																			<div className="grid grid-cols-[400px_100px]">
																				<Link href={file} target="_blank" className="flex gap-2 p-2 items-start text-ellipsis overflow-hidden whitespace-nowrap">
																					<BsFiletypePdf className="w-6 h-6 text-red-500" />
																					{convertToReadableName(file)}
																				</Link>
																				<div className="grid place-ite">
																					<X
																						className="text-red-500 cursor-pointer hover:text-red-600 transition-all hover:scale-125"
																						onClick={() => {
																							let supporting_documents = form.getValues("supporting_documents"); // FileList
																							supporting_documents = Array.from(supporting_documents);
																							supporting_documents.splice(index, 1);
																							files.splice(index, 1);
																							form.setValue("supporting_documents", supporting_documents);
																							form.trigger("supporting_documents");
																						}}
																					/>
																				</div>
																			</div>
																		) : (
																			<div className="grid grid-cols-[400px_100px]">
																				<div className="flex gap-2 p-2 items-start text-ellipsis overflow-hidden whitespace-nowrap">
																					<BsFiletypePdf className="w-6 h-6 text-red-500" />
																					{file.name}
																				</div>
																				<div className="grid place-ite">
																					<X
																						className="text-red-500 cursor-pointer hover:text-red-600 transition-all hover:scale-125"
																						onClick={() => {
																							let supporting_documents = form.getValues("supporting_documents"); // FileList
																							supporting_documents = Array.from(supporting_documents);
																							supporting_documents.splice(index, 1);
																							files.splice(index, 1);
																							form.setValue("supporting_documents", supporting_documents);
																							form.trigger("supporting_documents");
																						}}
																					/>
																				</div>
																			</div>
																		)

																		}

																	</div>
																))}
														</div>
													</FormItem>
												)}
											/>
										</section>

										<Separator className="my-8" />

										<section className="section-6" id="Applicant Declaration">
											<h1 className="text-2xl font-bold mb-4">6. Applicant Declaration</h1>
											<p className="text-gray-500 dark:text-gray-400 mb-8">
												I (or acting as representative of group travelling) hereby confirm the accuracy of the information (including
												any attachments) provided for this application.
											</p>
											<div className="grid gap-8">
												<div className="grid grid-auto-fit-lg gap-8">
													<FormField
														control={form.control}
														name="applicant_declaration_name"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Name <span className="text-red-500"> *</span></FormLabel>
																<FormControl>
																	<Input
																		disabled={externalForm.formStage != 1}
																		className="disabled:text-black-500 disabled:opacity-100"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name="applicant_declaration_position_title"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Position Title <span className="text-red-500"> *</span></FormLabel>
																<FormControl>
																	<Input
																		disabled={externalForm.formStage != 1}
																		className="disabled:text-black-500 disabled:opacity-100"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>

												<FormField
													control={form.control}
													name="applicant_declaration_date"
													render={({ field }) => (
														<FormItem className="flex flex-col">
															<FormLabel>Declaration Date <span className="text-red-500"> *</span></FormLabel>
															<Popover>
																<PopoverTrigger asChild>
																	<FormControl>
																		<Button
																			disabled={externalForm.formStage != 1}
																			variant={"outline"}
																			className={cn(
																				"w-full pl-3 text-left font-normal",
																				!field.value && "text-muted-foreground",
																			)}>
																			{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
																		</Button>
																	</FormControl>
																</PopoverTrigger>
																<PopoverContent className="w-auto p-0" align="start">
																	<Calendar
																		mode="single"
																		selected={field.value}
																		onSelect={date => {
																			field.onChange(date);
																			if (date !== undefined) {
																				date.setHours(date.getHours() + 8);
																				field.value = new Date(date);
																			}
																		}}
																		disabled={date => {
																			const today = new Date();
																			return date < today;
																		}}
																		initialFocus
																	/>
																</PopoverContent>
															</Popover>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="applicant_declaration_signature"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Signature <span className="text-red-500"> *</span></FormLabel>
															<Dialog>
																{externalForm.formStage !== 1 ? (
																	<div className="w-full min-h-[200px] h-fit border-2 border-gray-300 rounded-md grid place-items-center">
																		{applicantImageURL && (
																			<Image src={applicantImageURL}
																				width={300}
																				height={200}
																				alt="Signature"
																				className="w-[300px] h-fit"
																			/>
																		)}
																	</div>
																) : (
																	<>
																		<FormControl>
																			<DialogTrigger asChild>
																				<div className="w-full min-h-[200px] h-fit border-2 border-gray-300 rounded-md grid place-items-center">
																					{applicantImageURL && (
																						<Image
																							src={applicantImageURL}
																							width={300}
																							height={200}
																							alt="Signature"
																							className="w-[300px] h-fit"
																						/>
																					)}
																				</div>
																			</DialogTrigger>
																		</FormControl>
																		<DialogContent>
																			<DialogHeader>
																				<DialogTitle>Signature</DialogTitle>
																				<DialogClose />
																			</DialogHeader>
																			<DialogDescription>Please sign below</DialogDescription>
																			<div className="w-full h-[200px] border-2 border-gray-300 rounded-md">
																				<SignaturePad
																					// @ts-ignore
																					ref={applicantSigCanvas}
																					canvasProps={{
																						className: "w-full h-full",
																					}}
																				/>
																			</div>
																			<DialogFooter>
																				<Button variant="outline" onClick={() => applicantSigClear(field)}>
																					Clear
																				</Button>
																				<DialogClose asChild>
																					<Button
																						onClick={() => {
																							//@ts-ignore
																							if (applicantSigCanvas.current.isEmpty()) {
																								toast.error("Please sign the form");
																							} else {
																								setApplicantImageURL(
																									applicantSigCanvas.current
																										//@ts-ignore
																										.getTrimmedCanvas()
																										.toDataURL("image/png"),
																								);
																								field.onChange(
																									applicantSigCanvas.current
																										//@ts-ignore
																										.getTrimmedCanvas()
																										.toDataURL("image/png"),
																								);

																								field.value =
																									applicantSigCanvas.current
																										//@ts-ignore
																										.getTrimmedCanvas()
																										.toDataURL("image/png") ?? "";
																							}
																						}}>
																						Save
																					</Button>
																				</DialogClose>
																			</DialogFooter>
																		</DialogContent>
																	</>
																)}

																<FormMessage />
															</Dialog>
														</FormItem>
													)}
												/>
											</div>
										</section>

										<Separator className="my-8" />

										{externalForm.formStage! >= 3 ? (
											<section className="section-7" id="Verification">
												<h1 className="text-2xl font-bold mb-4">7. Verification</h1>
												<p className="text-gray-500 dark:text-gray-400 mb-8">I have verified and support of this application.</p>
												<div className="grid gap-8">
													<div className="grid grid-auto-fit-lg gap-8">
														<FormField
															control={form.control}
															name="verification_name"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Name</FormLabel>
																	<FormControl>
																		<Input disabled={externalForm.formStage != 3} placeholder="" {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<FormField
															control={form.control}
															name="verification_position_title"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Position Title</FormLabel>
																	<FormControl>
																		<Input disabled={externalForm.formStage != 3} placeholder="" {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>

													<FormField
														control={form.control}
														name="verification_date"
														render={({ field }) => (
															<FormItem className="flex flex-col">
																<FormLabel>Declaration Date</FormLabel>
																<Popover>
																	<PopoverTrigger asChild>
																		<FormControl>
																			<Button
																				disabled={externalForm.formStage != 3}
																				variant={"outline"}
																				className={cn(
																					"w-full pl-3 text-left font-normal",
																					!field.value && "text-muted-foreground",
																				)}>
																				{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
																			</Button>
																		</FormControl>
																	</PopoverTrigger>
																	<PopoverContent className="w-auto p-0" align="start">
																		<Calendar
																			mode="single"
																			selected={field.value!}
																			onSelect={date => {
																				field.onChange(date);
																				if (date !== undefined) {
																					date.setHours(date.getHours() + 8);
																					field.value = new Date(date);
																				}
																			}}
																			disabled={date => {
																				const today = new Date();
																				today.setHours(0, 0, 0, 0);
																				return date < today;
																			}}
																			initialFocus
																		/>
																	</PopoverContent>
																</Popover>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name="verification_signature"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Signature</FormLabel>
																<Dialog open={verificationSignatureDialogOpen} onOpenChange={setVerificationSignatureDialogOpen}>
																	<FormControl>
																		<DialogTrigger asChild>
																			<button disabled={data.formStage !== 3} className="w-full border-2 min-h-[200px] h-fit disabled:cursor-not-allowed border-gray-300 rounded-md grid place-items-center relative">
																				{field.value ? (
																					<Image
																						src={verificationImageURL!}
																						width={300}
																						height={200}
																						alt="Signature"
																						className="w-[300px] h-fit"
																					/>
																				) : (
																					<div>Click to upload or draw signature</div>
																				)}
																			</button>
																		</DialogTrigger>
																	</FormControl>
																	<DialogContent>
																		<Tabs defaultValue="upload">
																			<TabsList className="grid w-full grid-cols-2 my-3">
																				<TabsTrigger value="upload">Upload</TabsTrigger>
																				<TabsTrigger value="draw">Draw</TabsTrigger>
																			</TabsList>
																			<TabsContent value="upload">
																				<DialogHeader>
																					<DialogTitle className="mb-4">Upload Signature Image</DialogTitle>
																				</DialogHeader>
																				<FormLabel className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
																					<div className="flex flex-col items-center justify-center pt-5 pb-6">
																						<svg
																							className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
																							aria-hidden="true"
																							xmlns="http://www.w3.org/2000/svg"
																							fill="none"
																							viewBox="0 0 20 16"
																						>
																							<path
																								stroke="currentColor"
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								strokeWidth="2"
																								d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
																							/>
																						</svg>
																						<p className="mb-2 text-base text-gray-500 dark:text-gray-400">
																							<span className="font-semibold">Click or drag to upload</span>
																							<div className="font-semibold">Format: JPG, PNG, JPEG</div>
																						</p>
																						{field?.value instanceof File && (
																							<p className="mt-2 text-xl text-slate-700">Image Uploaded</p>
																						)}
																					</div>
																					<FormControl className="absolute">
																						<Input
																							className="absolute w-full h-full opacity-0 cursor-pointer"
																							type="file"
																							accept="image/*"
																							onChange={event => {
																								if (event.target.files) {
																									field.onChange(event.target.files[0]);
																									form.trigger("verification_signature");

																									setVerificationImageURL(URL.createObjectURL(event.target.files[0]));

																									setApprovalSignatureDialogOpen(false)
																								}
																							}}
																						/>
																					</FormControl>
																				</FormLabel>
																			</TabsContent>
																			<TabsContent value="draw">
																				<DialogHeader className="my-3">
																					{/* <DialogTitle>Draw Signature</DialogTitle> */}
																				</DialogHeader>
																				{/* <DialogDescription className="mb-4">Please sign below</DialogDescription> */}
																				<div className="w-full h-[200px] border-2 border-gray-300 rounded-md relative">
																					<SignaturePad
																						// @ts-ignore
																						ref={verificationSigCanvas}
																						canvasProps={{
																							className: "w-full h-full",
																						}}
																					/>
																				</div>
																				<DialogFooter className="mt-8">
																					<Button variant="outline" onClick={verificationSigClear}>
																						Clear
																					</Button>
																					<DialogClose asChild>
																						<Button
																							onClick={() => {
																								setVerificationImageURL(
																									verificationSigCanvas.current
																										//@ts-ignore
																										.getTrimmedCanvas()
																										.toDataURL("image/png"),
																								);
																								field.onChange(
																									verificationSigCanvas.current
																										// @ts-ignore
																										.getTrimmedCanvas()
																										.toDataURL("image/png"),
																								);
																							}}
																						>
																							Save
																						</Button>
																					</DialogClose>
																				</DialogFooter>
																			</TabsContent>
																		</Tabs>
																	</DialogContent>
																	<FormMessage />
																</Dialog>
															</FormItem>
														)}
													/>
												</div>
											</section>
										) : null}

										{externalForm.formStage! >= 4 ? (
											<section className="section-8" id="Approval">
												<h1 className="text-2xl font-bold mb-4">8. Approval</h1>
												<p className="text-gray-500 dark:text-gray-400 mb-8">I have reviewed, and approve this application.</p>
												<div className="grid gap-8">
													<div className="grid grid-auto-fit-lg gap-8">
														<FormField
															control={form.control}
															name="approval_name"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Name</FormLabel>
																	<FormControl>
																		<Input placeholder="" {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<FormField
															control={form.control}
															name="approval_position_title"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Position Title</FormLabel>
																	<FormControl>
																		<Input placeholder="" {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>

													<FormField
														control={form.control}
														name="approval_date"
														render={({ field }) => (
															<FormItem className="flex flex-col">
																<FormLabel>Declaration Date</FormLabel>
																<Popover>
																	<PopoverTrigger asChild>
																		<FormControl>
																			<Button
																				variant={"outline"}
																				className={cn(
																					"w-full pl-3 text-left font-normal",
																					!field.value && "text-muted-foreground",
																				)}>
																				{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
																			</Button>
																		</FormControl>
																	</PopoverTrigger>
																	<PopoverContent className="w-auto p-0" align="start">
																		<Calendar
																			mode="single"
																			selected={field.value!}
																			onSelect={date => {
																				field.onChange(date);
																				if (date !== undefined) {
																					date.setHours(date.getHours() + 8);
																					field.value = new Date(date);
																				}
																			}}
																			disabled={date => {
																				const today = new Date();
																				today.setHours(0, 0, 0, 0);
																				return date < today;
																			}}
																			initialFocus
																		/>
																	</PopoverContent>
																</Popover>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name="approval_signature"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Signature</FormLabel>
																<Dialog open={approvalSignatureDialogOpen} onOpenChange={setApprovalSignatureDialogOpen}>
																	<FormControl>
																		<DialogTrigger asChild>
																			<button disabled={data.formStage !== 4} className="w-full border-2 min-h-[200px] h-fit disabled:cursor-not-allowed border-gray-300 rounded-md grid place-items-center relative">
																				{field.value ? (
																					<Image
																						src={approvalImageURL!}
																						width={300}
																						height={200}
																						alt="Signature"
																						className="w-[300px] h-fit"
																					/>
																				) : (
																					<div>Click to Upload or Draw Signature</div>
																				)}
																			</button>
																		</DialogTrigger>
																	</FormControl>
																	<DialogContent>
																		<Tabs defaultValue="upload">
																			<TabsList className="grid w-full grid-cols-2 my-3">
																				<TabsTrigger value="upload">Upload Signature</TabsTrigger>
																				<TabsTrigger value="draw">Draw Signature</TabsTrigger>
																			</TabsList>
																			<TabsContent value="upload">
																				<DialogHeader>
																					<DialogTitle className="mb-4">Format (PNG, JPG, JPEG)</DialogTitle>
																				</DialogHeader>
																				<FormLabel className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
																					<div className="flex flex-col items-center justify-center pt-5 pb-6">
																						<svg
																							className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
																							aria-hidden="true"
																							xmlns="http://www.w3.org/2000/svg"
																							fill="none"
																							viewBox="0 0 20 16"
																						>
																							<path
																								stroke="currentColor"
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								strokeWidth="2"
																								d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
																							/>
																						</svg>
																						<p className="mb-2 text-base text-gray-500 dark:text-gray-400">
																							<span className="font-semibold">Click or drag to upload</span>
																							<div className="font-semibold">Format: JPG, PNG, JPEG</div>
																						</p>
																						{field?.value instanceof File && (
																							<p className="mt-2 text-xl text-slate-700">Image Uploaded</p>
																						)}
																					</div>
																					<FormControl className="absolute">
																						<Input
																							className="absolute w-full h-full opacity-0 cursor-pointer"
																							type="file"
																							accept="image/*"
																							onChange={event => {
																								if (event.target.files) {
																									field.onChange(event.target.files[0]);
																									form.trigger("approval_signature");

																									setApprovalImageURL(URL.createObjectURL(event.target.files[0]));

																									setApprovalSignatureDialogOpen(false)
																								}
																							}}
																						/>
																					</FormControl>
																				</FormLabel>
																			</TabsContent>
																			<TabsContent value="draw">
																				<DialogHeader className="my-3">
																					<DialogTitle>Draw Signature</DialogTitle>
																				</DialogHeader>
																				<DialogDescription className="mb-4">Please sign below</DialogDescription>
																				<div className="w-full h-[200px] border-2 border-gray-300 rounded-md relative">
																					<SignaturePad
																						// @ts-ignore
																						ref={approvalSigCanvas}
																						canvasProps={{
																							className: "w-full h-full",
																						}}
																					/>
																				</div>
																				<DialogFooter className="mt-8">
																					<Button variant="outline" onClick={approvalSigClear}>
																						Clear
																					</Button>
																					<DialogClose asChild>
																						<Button
																							onClick={() => {
																								setApprovalImageURL(
																									approvalSigCanvas.current
																										//@ts-ignore
																										.getTrimmedCanvas()
																										.toDataURL("image/png"),
																								);
																								field.onChange(
																									approvalSigCanvas.current
																										// @ts-ignore
																										.getTrimmedCanvas()
																										.toDataURL("image/png"),
																								);
																							}}
																						>
																							Save
																						</Button>
																					</DialogClose>
																				</DialogFooter>
																			</TabsContent>
																		</Tabs>
																	</DialogContent>
																	<FormMessage />
																</Dialog>
															</FormItem>
														)}
													/>
												</div>
											</section>
										) : null}

										{externalForm.formStage === 1 ? (
											<div>
												<FormField
													control={form.control}
													name="securityKey"
													render={({ field }) => (
														<FormItem>
															<FormLabel>
																<div className="group relative w-max cursor-pointer">
																	<span className="flex items-center">
																		<span className="mr-2">Security Key</span>
																		<TooltipIcon />
																	</span>
																	<span className="z-[999] bg-slate-100 pointer-events-none absolute ml-2 rounded-md w-[200px] text-justify opacity-0 transition-opacity group-hover:opacity-100 p-3 border-2">
																		This is to ensure that you are the appropriate individual for the authorization or
																		rejection of this form. It can be found in your email.
																	</span>
																</div>
															</FormLabel>
															<FormControl>
																<Input
																	autoComplete="off"
																	placeholder=""
																	{...field}
																	onChange={e => {
																		field.onChange(e.target.value);
																		if (e.target.value === externalForm.securityKey) {
																			setSecurityKeyError(false);
																		} else {
																			setSecurityKeyError(true);
																		}
																	}}
																/>
															</FormControl>
															<FormMessage>{securityKeyError && <span>The security key does not match.</span>}</FormMessage>
														</FormItem>
													)}
												/>
												<Dialog open={applicantOpen} onOpenChange={setApplicantOpen}>
													<DialogTrigger asChild>
														<Button className="mt-5" type="button">
															Submit for Review
														</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogHeader>
															<DialogTitle>Please re-confirm your details!</DialogTitle>
															<DialogDescription>
																Please confirm your email is correct: {form.getValues("email")}
																. <br />
																Wrong email will result in you not receiving any updates of your form status.
															</DialogDescription>
														</DialogHeader>
														<DialogFooter>
															<DialogClose asChild>
																<Button variant="outline">Cancel</Button>
															</DialogClose>
															<Button onMouseUp={checkFormStatus} onClick={form.handleSubmit(onSubmit)}>
																Submit
															</Button>
														</DialogFooter>
													</DialogContent>
												</Dialog>
											</div>
										) : null}

										{externalForm.formStage === 2 && authToken ? (
											<div>
												<section className="submission-details mb-5">
													<h1 className="text-2xl font-bold mb-4">Submission Details</h1>
													<div className="grid grid-auto-fit-lg gap-8">
														<FormField
															control={form.control}
															name="verification_email"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Verification Email</FormLabel>
																	<Select onValueChange={field.onChange} defaultValue={field.value!}>
																		<FormControl>
																			<SelectTrigger>
																				<SelectValue placeholder="Please select an option" />
																			</SelectTrigger>
																		</FormControl>
																		<SelectContent>
																			{emails
																				.filter(email => email.extECategory === 1)
																				.map((email, index) => (
																					<SelectItem key={index} value={email.extEMail}>
																						{email.extEMail}
																					</SelectItem>
																				))}
																		</SelectContent>
																	</Select>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<FormField
															control={form.control}
															name="approval_email"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Approval Email</FormLabel>
																	<Select onValueChange={field.onChange} defaultValue={field.value!}>
																		<FormControl>
																			<SelectTrigger>
																				<SelectValue placeholder="Please select an option" />
																			</SelectTrigger>
																		</FormControl>
																		<SelectContent>
																			{emails
																				.filter(email => email.extECategory === 2)
																				.map((email, index) => (
																					<SelectItem key={index} value={email.extEMail}>
																						{email.extEMail}
																					</SelectItem>
																				))}
																		</SelectContent>
																	</Select>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
												</section>

												<Dialog open={revertOpen} onOpenChange={setRevertOpen}>
													<DialogTrigger asChild>
														<Button
															type="button"
															className="mr-5">
															Revert
														</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogHeader>
															<DialogTitle>Revert</DialogTitle>
														</DialogHeader>
														<DialogDescription>
															Are you sure you want to REVERT this form? Please enter a comment below.
														</DialogDescription>
														<FormField
															control={form.control}
															name="revertComment"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Comments</FormLabel>
																	<FormControl>
																		<Textarea {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<DialogFooter>
															<DialogClose asChild>
																<Button>Cancel</Button>
															</DialogClose>
															<Button
																onMouseUp={() => {
																	setRevertOpen(false);
																}}
																onClick={form.handleSubmit(handleRevert)}>
																Revert
															</Button>
														</DialogFooter>
													</DialogContent>
												</Dialog>

												<Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
													<DialogTrigger asChild>
														<Button type="button">
															Submit for Review
														</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogHeader>
															<DialogTitle>Confirm your action!</DialogTitle>
														</DialogHeader>
														<DialogDescription>
															Wrong email information will result in the form being sent to the wrong person.
														</DialogDescription>
														<DialogFooter>
															<DialogClose asChild>
																<Button variant="outline">Cancel</Button>
															</DialogClose>
															<Button
																onMouseUp={() => {
																	setSubmitOpen(false);
																}}
																onClick={form.handleSubmit(onSubmit)}>
																Submit
															</Button>
														</DialogFooter>
													</DialogContent>
												</Dialog>
											</div>
										) : externalForm.formStage === 3 || externalForm.formStage === 4 ? (
											<div>
												<FormField
													control={form.control}
													name="securityKey"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="group relative w-max cursor-pointer">
																<div className="flex items-center">
																	<span className="mr-2">Security Key</span>
																	<TooltipIcon />
																</div>
																<div className="z-[999] bg-slate-100 pointer-events-none absolute ml-2 rounded-md w-[200px] text-justify opacity-0 transition-opacity group-hover:opacity-100 p-3 border-2">
																	This is to ensure that you are the appropriate individual for the authorization or
																	rejection of this form. It can be found in your email.
																</div>
															</FormLabel>
															<FormControl>
																<Input
																	autoComplete="off"
																	placeholder=""
																	{...field}
																	onChange={e => {
																		field.onChange(e.target.value);
																		if (e.target.value === externalForm.securityKey) {
																			setSecurityKeyError(false);
																		} else {
																			setSecurityKeyError(true);
																		}
																	}}
																/>
															</FormControl>
															<FormMessage>{securityKeyError && <span>The security key does not match.</span>}</FormMessage>
														</FormItem>
													)}
												/>
												{externalForm.formStage === 3 ? (
													<div className="mt-5">
														<Dialog open={revertOpen} onOpenChange={setRevertOpen}>
															<DialogTrigger asChild>
																<Button
																	type="button"
																	className="mr-5"
																	disabled={form.getValues("securityKey") !== externalForm.securityKey}>
																	Reject
																</Button>
															</DialogTrigger>
															<DialogContent>
																<DialogHeader>
																	<DialogTitle>Please confirm your action.</DialogTitle>
																</DialogHeader>
																<DialogDescription>
																	You are now REJECTING this Nominations/ Travelling Form. Please confirm your action by filling the reject reason and clicking the REJECT button.
																</DialogDescription>
																<FormField
																	control={form.control}
																	name="revertComment"
																	render={({ field }) => (
																		<FormItem>
																			<FormLabel>Comments</FormLabel>
																			<FormControl>
																				<Input {...field} />
																			</FormControl>
																			<FormMessage />
																		</FormItem>
																	)}
																/>
																<DialogFooter>
																	<DialogClose asChild>
																		<Button>Cancel</Button>
																	</DialogClose>
																	<Button
																		onMouseUp={() => {
																			setRevertOpen(false);
																		}}
																		onClick={form.handleSubmit(handleRevert)}>
																		Reject
																	</Button>
																</DialogFooter>
															</DialogContent>
														</Dialog>

														<Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
															<DialogTrigger asChild>
																<Button type="button" disabled={form.getValues("securityKey") !== externalForm.securityKey}>
																	Submit for Review
																</Button>
															</DialogTrigger>
															<DialogContent>
																<DialogHeader>
																	<DialogTitle>Please confirm your action.</DialogTitle>
																</DialogHeader>
																<DialogDescription>
																	You are now SUBMITTING this Nominations/ Travelling Form FOR FURTHER REVIEW. Please confirm your action by clicking the SUBMIT button.
																</DialogDescription>
																<DialogFooter>
																	<DialogClose asChild>
																		<Button variant="outline">Cancel</Button>
																	</DialogClose>
																	<Button
																		onMouseUp={() => {
																			checkFormStatus();
																			setSubmitOpen(false);
																		}}
																		onClick={form.handleSubmit(onSubmit)}>
																		Submit
																	</Button>
																</DialogFooter>
															</DialogContent>
														</Dialog>
													</div>
												) : externalForm.formStage === 4 ? (
													<div className="mt-5">
														<Dialog open={revertOpen} onOpenChange={setRevertOpen}>
															<DialogTrigger asChild>
																<Button
																	variant="destructive"
																	type="button"
																	className="mr-5"
																	disabled={form.getValues("securityKey") !== externalForm.securityKey}>
																	Reject
																</Button>
															</DialogTrigger>
															<DialogContent>
																<DialogHeader>
																	<DialogTitle>Please confirm your action.</DialogTitle>
																</DialogHeader>
																<DialogDescription>
																	You are now REJECTING this Nominations/ Travelling Form. Please confirm your action by filling the reason and clicking the REJECT button.
																</DialogDescription>
																<FormField
																	control={form.control}
																	name="revertComment"
																	render={({ field }) => (
																		<FormItem>
																			<FormLabel>Comments</FormLabel>
																			<FormControl>
																				<Input {...field} />
																			</FormControl>
																			<FormMessage />
																		</FormItem>
																	)}
																/>
																<DialogFooter>
																	<DialogClose asChild>
																		<Button>Cancel</Button>
																	</DialogClose>
																	<Button
																		onMouseUp={() => {
																			setRevertOpen(false);
																		}}
																		onClick={form.handleSubmit(handleRevert)}>
																		Reject
																	</Button>
																</DialogFooter>
															</DialogContent>
														</Dialog>

														<Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
															<DialogTrigger asChild>
																<Button type="button" disabled={form.getValues("securityKey") !== externalForm.securityKey}>
																	Approve
																</Button>
															</DialogTrigger>
															<DialogContent>
																<DialogHeader>
																	<DialogTitle>Please confirm your action.</DialogTitle>
																</DialogHeader>
																<DialogDescription>
																	You are now APPROVING this Nominations/ Travelling Form. Please confirm your action by clicking the SUBMIT button.
																</DialogDescription>
																<DialogFooter>
																	<DialogClose asChild>
																		<Button variant="outline">Cancel</Button>
																	</DialogClose>
																	<Button
																		onMouseUp={() => {
																			setSubmitOpen(false);
																		}}
																		onClick={form.handleSubmit(onSubmit)}>
																		Submit
																	</Button>
																</DialogFooter>
															</DialogContent>
														</Dialog>
													</div>
												) : null}
											</div>
										) : null}
									</form>
								</Form>
							</div>
						</div>
					) : (
						// DO NOT TOUCH THIS.
						// This is the final stage of the form,
						<div>
							<NTFPDF id={data.id} />
						</div>
					)}
				</>
			) : selectedTab === "Print" ? (
				<>
					<div>
						<NTFPDF id={data.id} />
					</div>
				</>
			) : (
				<>
					N/A
				</>
			)}
		</div>
	);
}
