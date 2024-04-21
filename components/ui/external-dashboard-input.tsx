import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
	return (
		<input
			type={type}
			className={cn(
				`disabled:opacity-[0.85] disabled:cursor-default disabled:hover:shadow-[0_0_0_2px_#EFEFEF_inset] disabled:focus:shadow-[0_0_0_2px_#EFEFEF_inset] disabled:focus:border-none disabled:focus:ring-0 disabled:focus:ring-offset-0 disabled:focus:ring-transparent
				flex h-12 w-full border border-gray-200 rounded-xl shadow-[0_0_0_2px_#EFEFEF_inset] hover:shadow-[0_0_0_2px_#9A9FA5_inset] hover:border-[#dbdbdb] 
				focus:shadow-[0_0_0_2px_#9A9FA5_inset] focus:border-[#9A9FA5] focus:ring-0 focus:ring-offset-0 focus:ring-transparent ring-offset-transparent transition-all focus:bg-white 
				border-none text-sm bg-white px-3 py-2 text-[15px] font-semibold file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 
				dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300
				`,
				className,
			)}
			ref={ref}
			{...props}
		/>
	);
});
Input.displayName = "Input";

export { Input };
