"use client";

import React, { useEffect } from "react";
import AttendanceSettings from "@/components/settings/attendance_settings";
import CreateAdminAccount from "@/components/settings/create_account";
import ExternalEmails from "@/components/settings/external_emails";
import AttendanceTiming from "@/components/settings/attendance_timing";
import ExternalSettings from "@/components/settings/external_settings";

export default function Home() {
	return (
		<div className="px-5 py-5 bg-slate-100 dark:bg-dark_mode_bg min-h-screen">
			{/* <div className="flex flex-col space-y-4">
				<div className="flex-1">
					<CreateAdminAccount />
				</div>
				<div className="flex-1">
					<AttendanceSettings />
				</div>
				<div className="flex-1">
					<ExternalEmails />
				</div>
				<div className="flex-1">
					<AttendanceTiming />
				</div>
			</div> */}
			<div className="pl-5 pr-5 pt-4 pb-6 mb-4 bg-white rounded-lg shadow-lg dark:bg-dark_mode_card">
				<div className="font-bold text-[18px] lg:text-[24px] dark:text-dark_text">
					<p>System Settings</p>
				</div>
				<div className="space-y-4">
					<div className="border-t border-gray-300 my-2"></div>
					<AttendanceTiming />
					<div className="border-t border-gray-300 my-2"></div>
					<AttendanceSettings />
					<div className="border-t border-gray-300 my-2"></div>
					<CreateAdminAccount />
					<div className="border-t border-gray-300 my-2"></div>
					<ExternalEmails />
					<div className="border-t border-gray-300 my-2"></div>
					<ExternalSettings />
				</div>
			</div>
		</div>
	);
}
