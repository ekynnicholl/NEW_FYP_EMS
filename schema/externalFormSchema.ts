import * as z from "zod";

const today = new Date();
today.setHours(0, 0, 0, 0);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes

const externalFormSchema = z.object({
	// Section 1
	email: z.string().email({ message: "Please enter a valid email address." }).nonempty({
		message: "Email is required",
	}),
	name: z.string().nonempty({ message: "Name is required" }).toUpperCase(),
	staff_id: z.string().nonempty({ message: "Staff ID / Student No. is required" }),
	course: z.string().nonempty({ message: "Designation / Course is required" }),
	faculty: z.string().nonempty({ message: "Faculty is required" }),
	transport: z.string().nonempty({ message: "Please select your transport type." }),
	traveling: z.string().nonempty({ message: "Please choose an item." }),
	other_member: z.string().optional(),

	// Section 2
	program_title: z.string().nonempty({ message: "Program / Event title is required" }),
	program_description: z.string().optional(),
	commencement_date: z
		.date({
			required_error: "Please select a date.",
			invalid_type_error: "Oops that's not a date!",
		})
		.min(today, { message: "Date must be today or in the future." }),
	completion_date: z
		.date()
		.refine(val => val >= today, { message: "Date must be today or in the future." }),
	organiser: z.string().nonempty({ message: "Organiser is required" }),
	venue: z.string().nonempty({ message: "Venue is required" }),
	HRDF_claimable: z.string().nonempty({ message: "Please select one of the option." }),

	// Section 3
	flight_date: z.date({
		required_error: "Flight Date is required.",
		invalid_type_error: "Oops that's not a date!",
	}),
	flight_time: z.string().nonempty({ message: "Flight time is required" }),
	flight_number: z.string().nonempty({ message: "Flight number is required" }),
	destination_from: z.string().nonempty({ message: "Destination is required" }),
	destination_to: z.string().nonempty({ message: "Destination is required" }),
	check_in_date: z.date({
		required_error: "Check-in date is required.",
		invalid_type_error: "Oops that's not a date!",
	}),
	check_out_date: z.date({
		required_error: "Check-out date is required.",
		invalid_type_error: "Oops that's not a date!",
	}),
	hotel: z.string().nonempty({ message: "Hotel is required" }),

	// // Section 4
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
	other_fee: z
		.number({
			invalid_type_error: "Oops that's not a number!",
		})
		.nonnegative({ message: "Other fee cannot be negative value." }),
	total_fee: z
		.number()
		.nonnegative({ message: "Total fee cannot be negative value." })
		.optional(),
	staff_development_fund: z.string().optional(),
	consolidated_pool_fund: z.string().optional(),
	research_fund: z.string().optional(),
	travel_fund: z.string().optional(),
	student_council_fund: z.string().optional(),
	other_fund: z.string().optional(),
	has_expenditure_cap: z.enum(["Yes", "No"]).optional(),
	expenditure_cap_amount: z
		.number()
		.nonnegative({ message: "Expenditure cap cannot be negative value." })
		.optional(),

	// Section 5
	supporting_documents: z
		.instanceof(FileList)
		.optional()
		.nullable()
		.refine(
			fileList => {
				if (fileList) {
					for (let i = 0; i < fileList.length; i++) {
						if (fileList?.item(i)?.size! > MAX_FILE_SIZE) {
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
	applicant_name: z.string().nonempty({ message: "Applicant name is required" }),
	applicant_position_title: z
		.string()
		.nonempty({ message: "Position title is required" }),
	applicant_declaration_date: z.string(),
	applicant_signature: z.string(),
});

export default externalFormSchema;
