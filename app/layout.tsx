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
				<Toaster position="top-right" />
				<ProgressBar height="4px" color="#ab0c12" shallowRouting />
				{children}
			</body>
		</html>
	);
}
