import * as z from "zod";

const today = new Date();
today.setHours(0, 0, 0, 0);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes

const LogisticArrangement = z.object({
	flight_date: z.date().nullable(),
	flight_time: z.string().nullable(),
	flight_number: z.string().optional(),
	destination_from: z.string().optional(),
	destination_to: z.string().optional(),
	hotel_name: z.string().optional(),
	check_in_date: z.date().nullable(),
	check_out_date: z.date().nullable(),
});

const externalFormSchema = z
	.object({
		// Additional Fields,
		formStage: z.number().optional(),

		// Section 1
		email: z
			.string()
			.email({ message: "Please enter a valid email address." })
			.nonempty({
				message: "Email is required",
			}),
		full_name: z
			.string()
			.nonempty({ message: "Name is required" })
			.toUpperCase(),
		staff_id: z.string().nonempty({ message: "Staff ID / Student No. is required" }),
		course: z.string().nonempty({ message: "Designation / Course is required" }),
		faculty: z.string().nonempty({ message: "Faculty is required" }),
		transport: z.string().nonempty({ message: "Please select your transport type." }),
		travelling: z.string().nonempty({ message: "Please choose an item." }),
		other_members: z.string().optional(),

		// Section 2
		program_title: z.string().nonempty({ message: "Program / Event title is required" }),
		program_description: z.string().optional(),
		commencement_date: z
			.date({
				required_error: "Please select a date.",
				invalid_type_error: "Oops that's not a date!",
			})
			.min(today, { message: "Date must be today or in the future." })
			.nullable(),
		completion_date: z
			.date()
			.refine(val => val >= today, {
				message: "Date must be today or in the future.",
			})
			.nullable(),
		organiser: z.string().nonempty({ message: "Organiser is required" }),
		venue: z.string().nonempty({ message: "Venue is required" }),
		hrdf_claimable: z.string().nonempty({ message: "Please select one of the option." }),

		// Section 3
		logistic_arrangement: z.array(LogisticArrangement).nullable(),

		// Section 4
		course_fee: z
			.number({
				required_error: "Course fee is required.",
				// invalid_type_error: "Oops that's not a number!",
			})
			.nonnegative({ message: "Course fee cannot be negative value." }),
		airfare_fee: z
			.number({
				required_error: "Airfare fee is required.",
				// invalid_type_error: "Oops that's not a number!",
			})
			.nonnegative({ message: "Airfare fee cannot be negative value." }),
		accommodation_fee: z
			.number({
				required_error: "Accommodation fee is required.",
				// invalid_type_error: "Oops that's not a number!",
			})
			.nonnegative({ message: "Accommodation fee cannot be negative value." }),
		per_diem_fee: z
			.number({
				required_error: "Per diem fee is required.",
				invalid_type_error: "Oops that's not a number!",
			})
			.nonnegative({ message: "Per diem fee cannot be negative value." }),
		transportation_fee: z
			.number({
				required_error: "Transport fee is required.",
				invalid_type_error: "Oops that's not a number!",
			})
			.nonnegative({ message: "Transport fee cannot be negative value." }),
		travel_insurance_fee: z
			.number({
				required_error: "Travel insurance fee is required.",
				invalid_type_error: "Oops that's not a number!",
			})
			.nonnegative({ message: "Travel insurance cannot be negative value." }),
		other_fees: z
			.number({
				invalid_type_error: "Oops that's not a number!",
			})
			.nonnegative({ message: "Other fee cannot be negative value." }),
		grand_total_fees: z
			.number()
			.nonnegative({ message: "Total fee cannot be negative value." })
			.optional(),
		staff_development_fund: z.string().optional(),
		consolidated_pool_fund: z.string().optional(),
		research_fund: z.string().optional(),
		travel_fund: z.string().optional(),
		student_council_fund: z.string().optional(),
		other_funds: z.string().optional(),
		expenditure_cap: z.enum(["Yes", "No"]).optional(),
		expenditure_cap_amount: z
			.number()
			.nonnegative({ message: "Expenditure cap cannot be negative value." })
			.optional(),

		// Section 5
		supporting_documents: z
			.any()
			.optional()
			.nullable()
			.refine(
				fileList => {
					if (fileList) {
						for (let i = 0; i < fileList.length; i++) {
							if (fileList[i].size! > MAX_FILE_SIZE) {
								return false;
							}
						}
					}
					return true;
				},
				{
					message: "All files must be smaller than 5MB.",
				},
			),

		// Section 6
		applicant_declaration_name: z.string().nonempty({ message: "Applicant name is required" }),
		applicant_declaration_position_title: z.string().nonempty({ message: "Position title is required" }),
		applicant_declaration_date: z.date({
			required_error: "Declaration date is required.",
			invalid_type_error: "Oops that's not a date!",
		}),
		applicant_declaration_signature: z.any(),
	})
	// if commencement date is before completion date, then return true
	// else return false
	.refine(
		data => {
			if (data.commencement_date && data.completion_date) {
				return data.commencement_date <= data.completion_date;
			}
			return true;
		},
		{
			message: "Commencement date must be before Completion date.",
			path: ["commencement_date"],
		},
	)
	// if travelling is in group, then other members is required
	// else return true
	.refine(
		data => {
			if (data.travelling === "group") {
				return data.other_members !== "";
			}
			return true;
		},
		{
			message: "Other members is required.",
			path: ["other_members"],
		},
	);

export default externalFormSchema;
