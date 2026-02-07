import * as React from "react";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?:
		| "primary"
		| "secondary"
		| "outline"
		| "ghost"
		| "destructive"
		| "gold";
	size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className = "", variant = "primary", size = "md", ...props }, ref) => {
		const variants = {
			primary:
				"bg-violet-600 text-white hover:bg-violet-700 shadow-sm shadow-violet-200",
			secondary:
				"bg-violet-100 text-violet-700 hover:bg-violet-200 border border-violet-200",
			outline:
				"bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400",
			ghost:
				"bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
			destructive:
				"bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
			gold: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 shadow-sm shadow-amber-200",
		};

		const sizes = {
			sm: "h-8 px-3 text-xs rounded-lg",
			md: "h-10 px-4 py-2 rounded-xl",
			lg: "h-12 px-6 text-base rounded-xl",
			icon: "h-10 w-10 p-2 flex items-center justify-center rounded-xl",
		};

		return (
			<button
				ref={ref}
				className={`
          inline-flex items-center justify-center font-medium transition-all duration-200 outline-none
          disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap
          focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
				{...props}
			/>
		);
	},
);

Button.displayName = "Button";
