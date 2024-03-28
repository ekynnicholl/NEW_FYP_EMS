"use client";

import "../scss/globals.scss";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Toaster } from "react-hot-toast";
import "../google_config";

import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<title>Event Management System</title>
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<body>
				{children}
				<ProgressBar height="4px" color="#ab0c12" options={{ showSpinner: false }} shallowRouting />
				{/* <Toaster position="top-right"
					toastOptions={{
						className: '',
						duration: 5000,
						style: {
							background: '#363636',
							color: '#fff',
						},

						success: {
							duration: 5000
						},
					}}
				/> */}
				<Toaster position="top-right" />
			</body>
		</html>
	);
}
