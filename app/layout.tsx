"use client";

import "../scss/globals.scss";
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="light">
			<title>Event Management System</title>
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<body>
				{children}
				<ProgressBar
					height="4px"
					color="#ab0c12"
					options={{ showSpinner: false }}
					shallowRouting
				/>
				<Toaster />
			</body>
		</html>
	);
}
