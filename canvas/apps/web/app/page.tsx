"use client";

import { ArrowRight, Plus, Sparkles, Users, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Antigravity from "../components/Antigravity";
import { Dashboard } from "../components/Dashboard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function Home() {
	const router = useRouter();
	const [roomId, setRoomId] = useState("");

	const createRoom = () => {
		const id = uuidv4();
		router.push(`/canvas/${id}`);
	};

	const joinRoom = (e: React.FormEvent) => {
		e.preventDefault();
		if (roomId.trim()) {
			router.push(`/canvas/${roomId.trim()}`);
		}
	};

	return (
		<main className="min-h-screen bg-[#f8f7f4] font-sans">
			{/* Navbar */}
			<nav className="border-b border-gray-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
					<Link href="/" className="flex items-center gap-2.5 group">
						<Image
							src="/logo.jpg"
							alt="LekhaFlow"
							width={36}
							height={36}
							className="h-9 w-auto rounded-lg"
						/>
						<span className="font-heading text-lg font-bold text-gray-900">
							LekhaFlow
						</span>
					</Link>
					<div className="flex items-center gap-2">
						<Link href="/login">
							<Button variant="ghost" size="sm">
								Sign in
							</Button>
						</Link>
						<Link href="/login">
							<Button size="sm">Get Started</Button>
						</Link>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="py-20 sm:py-28 px-6 relative overflow-hidden">
				{/* Antigravity particle background */}
				<Antigravity
					count={200}
					magnetRadius={6}
					ringRadius={7}
					waveSpeed={0.4}
					waveAmplitude={1}
					particleSize={1.2}
					lerpSpeed={0.05}
					color="#7c3aed"
					autoAnimate
					particleVariance={1}
					rotationSpeed={0}
					depthFactor={1}
					pulseSpeed={3}
					particleShape="capsule"
					fieldStrength={10}
					className="absolute inset-0 z-0 opacity-30"
				/>

				<div className="max-w-3xl mx-auto text-center space-y-8 relative z-10 px-4">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 text-violet-700 text-sm font-medium border border-violet-100">
						<span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
						Real-time collaboration
					</div>

					<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 font-heading tracking-tight leading-[1.08]">
						Think together,
						<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600">
							create together
						</span>
					</h1>

					<p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
						A collaborative whiteboard for teams to brainstorm, plan, and
						visualize ideas in real-time.
					</p>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
						<Button
							onClick={createRoom}
							size="lg"
							className="h-12 px-8 text-base shadow-lg shadow-violet-200/50"
						>
							<Plus className="w-5 h-5 mr-2" />
							Create New Canvas
						</Button>

						<span className="text-gray-400 text-sm hidden sm:block">or</span>

						<form onSubmit={joinRoom} className="flex gap-2">
							<Input
								value={roomId}
								onChange={(e) => setRoomId(e.target.value)}
								placeholder="Enter room code"
								className="w-44 h-12 bg-white"
							/>
							<Button
								type="submit"
								variant="outline"
								size="lg"
								disabled={!roomId.trim()}
								className="h-12"
							>
								Join
								<ArrowRight className="w-4 h-4 ml-2" />
							</Button>
						</form>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="py-10 border-y border-gray-200/60 bg-white/50">
				<div className="max-w-6xl mx-auto px-6">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
						<div className="flex items-center gap-3 justify-center">
							<div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
								<Zap className="w-4 h-4 text-green-600" />
							</div>
							<span className="text-gray-600 font-medium">Real-time sync</span>
						</div>
						<div className="flex items-center gap-3 justify-center">
							<div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
								<Sparkles className="w-4 h-4 text-violet-600" />
							</div>
							<span className="text-gray-600 font-medium">Infinite canvas</span>
						</div>
						<div className="flex items-center gap-3 justify-center">
							<div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
								<Users className="w-4 h-4 text-amber-600" />
							</div>
							<span className="text-gray-600 font-medium">
								Team collaboration
							</span>
						</div>
						<div className="flex items-center gap-3 justify-center">
							<div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
								<svg
									className="w-4 h-4 text-blue-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
									role="img"
									aria-label="Security icon"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									/>
								</svg>
							</div>
							<span className="text-gray-600 font-medium">
								Secure & private
							</span>
						</div>
					</div>
				</div>
			</section>

			{/* Dashboard Section */}
			<section className="px-6 py-16">
				<div className="max-w-6xl mx-auto">
					<div className="flex items-center justify-between mb-8">
						<h2 className="text-2xl font-bold text-gray-900 font-heading">
							Recent Canvases
						</h2>
					</div>
					<Dashboard />
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-gray-200/60 py-8 bg-white/50">
				<div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
					<span className="font-heading text-sm font-bold text-gray-500">
						LekhaFlow
					</span>
					<p className="text-sm text-gray-400">
						© 2026 LekhaFlow. Open-source collaborative canvas.
					</p>
				</div>
			</footer>
		</main>
	);
}
