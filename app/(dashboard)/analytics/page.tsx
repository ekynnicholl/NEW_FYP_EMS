"use client";

import BarChart from "@/components/analytics/BarChart";
import Histogram from "@/components/analytics/Histogram";
import ExpenditureGraph from "@/components/analytics/ExpenditureGraph";
import BarGraphAttendance from "@/components/analytics/BarGraphAttendance";
import PieChart from "@/components/analytics/PieChart";
import { SetStateAction, useEffect, useState } from "react";
import cookie from 'js-cookie';
import { useRouter } from "next/navigation";

export default function Home() {
	const router = useRouter();

	useEffect(() => {
		const checkIsUserLoggedIn = () => {
			const authToken = cookie.get('authToken');
			if (!authToken) {
				router.push("/unauthorizedAccess");
			}
		};

		checkIsUserLoggedIn();
	})

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

	const [selectedCategory, setSelectedCategory] = useState('all');

	const handleCategoryChange = (e: { target: { value: SetStateAction<string>; }; }) => {
		setSelectedCategory(e.target.value);
	};

	const currentDate = new Date();
	const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
	const currentYear = String(currentDate.getFullYear());

	const [selectedMonth, setSelectedMonth] = useState(currentMonth);
	const [selectedYear, setSelectedYear] = useState(currentYear);

	const handleMonthChangeExpenditure = (event: { target: { value: SetStateAction<string>; }; }) => {
		setSelectedMonth(event.target.value);
	};

	const handleYearChangeExpenditure = (event: { target: { value: SetStateAction<string>; }; }) => {
		setSelectedYear(event.target.value);
	};

	const getMonthText = (numericMonth: string) => {
		const months = [
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		];

		return months[parseInt(numericMonth, 10) - 1];
	};

	const generateYearOptions = (startYear: number, endYear: number) => {
		const options = [];
		for (let year = startYear; year <= endYear; year++) {
			options.push(<option key={year} value={year}>{year}</option>);
		}
		return options;
	};

	return (
		<div className="">
			<div className="flex-1">
				<div className="flex-1 mx-auto px-5 py-5 bg-slate-100 dark:bg-dark_mode_bg">
					<div className="p-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card">
						<div className="text-center">
							<h1 className="font-bold p-5 text-[20px] dark:text-dark_text">Budget Expenditure/ Faculty/ School/ Unit</h1>
							<div>
								<label htmlFor="month" className="text-light dark:text-dark_text">Month: </label>
								<select
									className="h-full mr-2 rounded-md border bg-white border-gray-400 mb-5 text-gray-700 py-1 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm lg:text-base dark:border-[#484E51] dark:bg-dark_mode_card dark:text-dark_text2"
									id="month"
									value={selectedMonth}
									onChange={handleMonthChangeExpenditure}
								>
									<option value="01">January</option>
									<option value="02">February</option>
									<option value="03">March</option>
									<option value="04">April</option>
									<option value="05">May</option>
									<option value="06">June</option>
									<option value="07">July</option>
									<option value="08">August</option>
									<option value="09">September</option>
									<option value="10">October</option>
									<option value="11">November</option>
									<option value="12">December</option>
								</select>
								<label htmlFor="year" className="text-light dark:text-dark_text">Year: </label>
								<select
									className="h-full rounded-md border mr-2 bg-white border-gray-400 mb-5 text-gray-700 py-1 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm lg:text-base dark:border-[#484E51] dark:bg-dark_mode_card dark:text-dark_text2"
									id="year"
									value={selectedYear}
									onChange={handleYearChangeExpenditure}
								>
									{/* You can dynamically generate the years you want. The first parameter is the min year and the second parameter is the max year. */}
									{generateYearOptions(2023, 2033)}
								</select>
							</div>
						</div>
						<ExpenditureGraph
							selectedMonth={parseInt(selectedMonth, 10)}
							selectedYear={parseInt(selectedYear, 10)}
							onTotalGrandTotalChange={handleTotalGrandTotalChange}
						/>
						<div className="text-center p-5 text-[20px] font-bold">
							<h2>Total Expenditure for {getMonthText(selectedMonth)}, {selectedYear}: RM{totalGrandTotal}</h2>
						</div>
					</div>


					<div className="p-4 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card">
						<div className="text-center font-bold p-5 text-slate-800 dark:text-dark_text text-[20px]">
							<h1>Number of Attendees each Faculty/ Unit by Date</h1>
						</div>
						<div className="justify-center items-center flex text-slate-800 dark:text-dark_text">
							<div className="">
								<label htmlFor="startDate" className="mr-2">
									Start Date:
								</label>
								<input
									type="date"
									id="startDate"
									name="startDate"
									value={startDate}
									onChange={handleDateChange}
									className="h-full rounded-md border bg-white border-gray-400 mb-5 text-gray-700 py-1 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm lg:text-base dark:border-[#484E51] dark:bg-dark_mode_card dark:text-dark_text2"
								/>
							</div>
							<div className="ml-4">
								<label htmlFor="endDate" className="mr-2">
									End Date:
								</label>
								<input
									type="date"
									id="endDate"
									name="endDate"
									value={endDate}
									onChange={handleDateChange}
									className="h-full rounded-md border bg-white border-gray-400 mb-5 text-gray-700 py-1 px-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm lg:text-base dark:border-[#484E51] dark:bg-dark_mode_card dark:text-dark_text2"
								/>
							</div>
							<div className="ml-4">
								<label htmlFor="category" className="mr-2">
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
						<div className="">
							<BarGraphAttendance startDate={startDate} endDate={endDate} category={selectedCategory} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
