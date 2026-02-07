import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@fontsource/cal-sans";
import "./globals.css";

const fontSans = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

export const metadata: Metadata = {
	title: "LekhaFlow | Collaborative Canvas",
	description: "Real-time visual collaboration for teams",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${fontSans.variable} font-sans antialiased`}>
				{children}
			</body>
		</html>
	);
}
