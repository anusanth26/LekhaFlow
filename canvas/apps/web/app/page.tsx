"use client";

import { ArrowRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
	const router = useRouter();
	const [roomId, setRoomId] = useState("");

	const createRoom = () => {
		const id = uuidv4();
		router.push(`/room/${id}`);
	};

	const joinRoom = (e: React.FormEvent) => {
		e.preventDefault();
		if (roomId.trim()) {
			router.push(`/room/${roomId.trim()}`);
		}
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
			<div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
				{/* Header */}
				<div className="bg-blue-600 p-8 text-center">
					<h1 className="text-3xl font-bold text-white mb-2">LekhaFlow</h1>
					<p className="text-blue-100">Real-time Collaborative Canvas</p>
				</div>

				{/* Body */}
				<div className="p-8 space-y-6">
					{/* Create Action */}
					<button
						type="button"
						onClick={createRoom}
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 group"
					>
						<Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
						Create New Room
					</button>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-gray-300" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="bg-white px-2 text-gray-500">
								Or join existing
							</span>
						</div>
					</div>

					{/* Join Form */}
					<form onSubmit={joinRoom} className="space-y-4">
						<div>
							<label
								htmlFor="roomId"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Room ID
							</label>
							<input
								type="text"
								id="roomId"
								value={roomId}
								onChange={(e) => setRoomId(e.target.value)}
								placeholder="e.g. room-123"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
							/>
						</div>
						<button
							type="submit"
							disabled={!roomId.trim()}
							className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
						>
							Join Room
							<ArrowRight className="w-4 h-4" />
						</button>
					</form>
				</div>
			</div>

			<p className="mt-8 text-center text-sm text-gray-500">
				Active Environment: {process.env.NODE_ENV}
			</p>
		</div>
	);
}
