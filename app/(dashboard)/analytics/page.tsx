"use client";

import ExpenditureGraph from "@/components/analytics/ExpenditureGraph";
import BarGraphAttendance from "@/components/analytics/BarGraphAttendance";
import { SetStateAction, useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function Home() {
	console.log("Hello from Home");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	const getStartAndEndOfMonth = () => {
		const today = new Date();
		const year = today.getFullYear();
		const month = today.getMonth() + 1;
		const lastDay = new Date(year, month, 0).getDate();
		const formattedMonth = month < 10 ? `0${month}` : `${month}`;
		const start = `${year}-${formattedMonth}-01`;
		const end = `${year}-${formattedMonth}-${lastDay}`;
		return {
			start,
			end,
		};
	};

	useEffect(() => {
		const { start, end } = getStartAndEndOfMonth();
		setStartDate(start);
		setEndDate(end);
	}, []);

	const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (name === "startDate") {
			if (new Date(value) > new Date(endDate)) {
				setEndDate(value);
			}
			setStartDate(value);
		} else if (name === "endDate") {
			if (new Date(value) < new Date(startDate)) {
				setStartDate(value);
			}
			setEndDate(value);
		}
	};

	const [totalGrandTotal, setTotalGrandTotal] = useState<number>(0);

	const handleTotalGrandTotalChange = (total: number) => {
		setTotalGrandTotal(total);
	};

	const [selectedCategory, setSelectedCategory] = useState("all");

	const handleCategoryChange = (e: { target: { value: SetStateAction<string> } }) => {
		setSelectedCategory(e.target.value);
	};

	const currentDate = new Date();
	const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
	const currentYear = String(currentDate.getFullYear());

	const [selectedMonth, setSelectedMonth] = useState(currentMonth);
	const [selectedYear, setSelectedYear] = useState(currentYear);

	const handleMonthChangeExpenditure = (value: string) => {
		setSelectedMonth(value);
	};

	const handleYearChangeExpenditure = (value: string) => {
		setSelectedYear(value);
	};

	const getMonthText = (numericMonth: string) => {
		const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		return months[parseInt(numericMonth, 10) - 1];
	};

	const generateYearOptions = (startYear: number, endYear: number) => {
		const options = [];
		for (let year = startYear; year <= endYear; year++) {
			options.push(
				<SelectItem key={year} value={year.toString()}>
					{year}
				</SelectItem>,
			);
		}
		return options;
	};

	return (
		<div className="flex-1 mx-auto px-5 py-5 bg-slate-100 dark:bg-dark_mode_bg">
			<div className="p-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card mt-5 lg:mt-0">
				<div className="text-center">
					<h1 className="font-bold p-5 text-[17px] lg:text-[20px] dark:text-dark_text">Budget Expenditure/ Faculty/ School/ Unit</h1>
					<div className="flex items-center justify-center gap-3">
						<div>
							<Label htmlFor="month" className="text-light dark:text-dark_text">
								Month:{" "}
							</Label>
							<Select defaultValue={selectedMonth} onValueChange={handleMonthChangeExpenditure}>
								<SelectTrigger id="month" className="w-[180px] ">
									<SelectValue placeholder="Month" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="01">January</SelectItem>
									<SelectItem value="02">February</SelectItem>
									<SelectItem value="03">March</SelectItem>
									<SelectItem value="04">April</SelectItem>
									<SelectItem value="05">May</SelectItem>
									<SelectItem value="06">June</SelectItem>
									<SelectItem value="07">July</SelectItem>
									<SelectItem value="08">August</SelectItem>
									<SelectItem value="09">September</SelectItem>
									<SelectItem value="10">October</SelectItem>
									<SelectItem value="11">November</SelectItem>
									<SelectItem value="12">December</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="year" className="text-light dark:text-dark_text">
								Year:{" "}
							</Label>
							<Select defaultValue={selectedYear} onValueChange={handleYearChangeExpenditure}>
								<SelectTrigger id="year">
									<SelectValue placeholder="Year" />
								</SelectTrigger>
								<SelectContent>{generateYearOptions(2023, 2033)}</SelectContent>
							</Select>
						</div>
					</div>
				</div>
				<ExpenditureGraph
					selectedMonth={parseInt(selectedMonth, 10)}
					selectedYear={parseInt(selectedYear, 10)}
					onTotalGrandTotalChange={handleTotalGrandTotalChange}
				/>
				<div className="text-center p-5 text-[17px] lg:text-[20px] font-bold dark:text-dark_text">
					<h2>
						Total Expenditure for {getMonthText(selectedMonth)}, {selectedYear}: RM{totalGrandTotal}
					</h2>
				</div>
			</div>

			<div className="p-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card">
				<div className="text-center font-bold p-5 text-slate-800 dark:text-dark_text text-[17px] lg:text-[20px]">
					<h1>Number of Attendees each Faculty/ Unit by Date</h1>
				</div>
				<div className="justify-center items-center lg:flex text-slate-800 dark:text-dark_text">
					<div className="">
						<label htmlFor="startDate" className="mr-2 text-sm lg:text-base">
							Start Date:
						</label>
						<input
							type="date"
							id="startDate"
							name="startDate"
							value={startDate}
							// onChange={handleDateChange}
							className="h-full rounded-md border bg-white border-gray-400 mb-5 text-gray-700 py-1 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm lg:text-base dark:border-[#484E51] dark:bg-dark_mode_card dark:text-dark_text2"
						/>
					</div>

					<div className="ml-4">
						<label htmlFor="endDate" className="mr-2 text-sm lg:text-base">
							End Date:
						</label>
						<input
							type="date"
							id="endDate"
							name="endDate"
							value={endDate}
							// onChange={handleDateChange}
							className="h-full rounded-md border bg-white border-gray-400 mb-5 text-gray-700 py-1 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm lg:text-base dark:border-[#484E51] dark:bg-dark_mode_card dark:text-dark_text2"
						/>
					</div>

					<div className="ml-4">
						<label htmlFor="category" className="mr-2 text-sm lg:text-base">
							Category:
						</label>
						<select
							id="category"
							name="category"
							value={selectedCategory}
							onChange={handleCategoryChange}
							className="h-full rounded-md border bg-white border-gray-400 mb-5 text-gray-700 py-1 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm lg:text-base dark:border-[#484E51] dark:bg-dark_mode_card dark:text-dark_text2"
						>
							<option value="all">All</option>
							<option value="staff">Staff</option>
							<option value="student">Student</option>
						</select>
					</div>
				</div>
				<div>
					<p className="text-[10px] lg:text-xs font-medium text-gray-600 -ml-[6px] text-center dark:text-slate-200 italic">
						Tip: You can change whether you want to view staff, student, or both using the &apos;Category&apos; filter.
					</p>
				</div>
				<div className="">
					<BarGraphAttendance startDate={startDate} endDate={endDate} category={selectedCategory} />
				</div>
			</div>
		</div>
	);
}
