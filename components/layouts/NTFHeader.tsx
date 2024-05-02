import Image from "next/image"

export default function NTFHeader() {
	return (
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
						Before completing this form, please refer to the separate document on “General Instructions for completing Nomination /
						Travelling Application Form”, which is available on SharePoint.
					</span>
				</p>
				<p className="mb-2">
					<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">*</span>
					<span>All fields are mandatory to complete as required for each applicable section.</span>
				</p>
				<p>
					<span className="text-[12px] lg:text-[14px] text-red-500 ml-[2px] mr-[6px]">*</span>
					<span>This form is also to be used for any contracted individual as consultant, and is to be completed where applicable.</span>
				</p>
			</div>
		</div>
	);
}
