import BarChart from "@/components/analytics/BarChart";
import Histogram from "@/components/analytics/Histogram";
import LineGraphExpenditure1 from "@/components/analytics/LineGraphExpenditure1";
import PieChart from "@/components/analytics/PieChart";

export default function Home() {
	return (
		<div className="h-screen flex flex-row justify-start bg-slate-100">

			<div className="flex-1">

				<div className="flex-1 mx-auto px-5 py-5">
					<div className="p-4 mb-4">
						<div className="bg-white p-8 rounded-lg shadow-lg">
							<LineGraphExpenditure1 />
						</div>
					</div>
					{/* <div className="flex">
						<div className="w-1/2 p-4">
							<div className="bg-white p-4 rounded-lg shadow-lg">Small Graph</div>
						</div>
						<div className="w-1/2 p-4">
							<div className="bg-white p-4 rounded-lg shadow-lg">Small Graph</div>
						</div>
					</div>
					<div className="p-4 mt-4">
						<div className="bg-white p-8 rounded-lg shadow-lg">
							<BarChart />
						</div>
					</div> */}
					{/* <div className="flex xs:pb-28">
						<div className="w-1/4 p-4">
							<div className="bg-white p-4 rounded-lg shadow-lg">
								<PieChart />
							</div>
						</div>
						<div className="w-1/4 p-4">
							<div className="bg-white p-4 rounded-lg shadow-lg">
								<PieChart />
							</div>
						</div>
						<div className="w-1/4 p-4">
							<div className="bg-white p-4 rounded-lg shadow-lg">
								<PieChart />
							</div>
						</div>
						<div className="w-1/4 p-4">
							<div className="bg-white p-4 rounded-lg shadow-lg">
								<PieChart />
							</div>
						</div>
					</div> */}
				</div>
			</div>
		</div >
	);
}
