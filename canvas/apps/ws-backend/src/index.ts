import "./env.js";

import { Database } from "@hocuspocus/extension-database";
import { Logger } from "@hocuspocus/extension-logger";
import { Server } from "@hocuspocus/server";
import { serverEnv } from "@repo/config/server";
import { createServiceClient } from "./supabase.server.js";

const supabase = createServiceClient();

const PORT = parseInt(serverEnv.WS_PORT, 10);

const server = Server.configure({
	port: PORT,

	extensions: [
		new Logger(),
		new Database({
			fetch: async ({ documentName }) => {
				const { data, error } = await supabase
					.from("canvases")
					.select("data")
					.eq("id", documentName)
					.maybeSingle();

				// maybeSingle returns null data if not found, without error
				if (error) {
					console.error("[Hocuspocus] Error fetching canvas:", error.message);
					return null;
				}

				// If no data exists yet, that's OK - return null to start fresh
				if (!data) {
					console.log(
						"[Hocuspocus] No existing canvas found for:",
						documentName,
					);
					return null;
				}

				// Handle bytea column - PostgreSQL returns hex string like \x5b312c33...
				if (data.data && typeof data.data === "string") {
					const hexString = data.data;
					console.log(
						"[Hocuspocus] Data is hex string for:",
						documentName,
						"starts with:",
						hexString.slice(0, 20),
					);

					// Remove \x prefix if present (PostgreSQL bytea hex format)
					let hex = hexString;
					if (hex.startsWith("\\x")) {
						hex = hex.slice(2);
					}

					// Convert hex string to Uint8Array
					try {
						const buffer = Buffer.from(hex, "hex");
						console.log(
							"[Hocuspocus] Decoded hex to buffer, length:",
							buffer.length,
							"first bytes:",
							Array.from(buffer.slice(0, 10)),
						);
						return new Uint8Array(buffer);
					} catch (e) {
						console.error("[Hocuspocus] Failed to decode hex:", e);
						return null;
					}
				}

				// If it's already a buffer/array (shouldn't happen but just in case)
				if (data.data && data.data instanceof Uint8Array) {
					return data.data;
				}

				console.log("[Hocuspocus] Unexpected data format:", typeof data.data);
				return null;
			},

			store: async ({ documentName, state, context }) => {
				// Get the authenticated user's ID from the context (set in onAuthenticate)
				const userId = (context as { user?: { id: string } })?.user?.id;

				if (!state || !(state instanceof Uint8Array)) {
					console.log("[Hocuspocus] No state to save for:", documentName);
					return;
				}

				// Convert Uint8Array to hex string with \x prefix for bytea column
				const hexData = `\\x${Buffer.from(state).toString("hex")}`;
				console.log(
					"[Hocuspocus] Converted state to hex, length:",
					hexData.length,
					"first chars:",
					hexData.slice(0, 30),
				);

				const { error } = await supabase.from("canvases").upsert(
					{
						id: documentName,
						data: hexData,
						updated_at: new Date().toISOString(),
						// Include owner_id for new inserts (required by foreign key constraint)
						...(userId && { owner_id: userId }),
						// Provide a default name for new canvases
						name: `Canvas ${documentName.slice(0, 8)}`,
					},
					{ onConflict: "id" },
				);

				if (error) {
					console.error("[Hocuspocus] Error saving canvas:", error.message);
				} else {
					console.log("[Hocuspocus] Successfully saved canvas:", documentName);
				}
			},
		}),
	],

	async onAuthenticate(data) {
		const { token } = data;

		console.log(
			"[Hocuspocus] onAuthenticate called, token length:",
			token?.length,
		);

		if (!token) {
			console.log("[Hocuspocus] No token provided");
			throw new Error("Unauthorized: No token provided");
		}

		console.log("[Hocuspocus] Validating token with Supabase...");
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token);

		console.log("[Hocuspocus] getUser result:", {
			user: user?.id,
			error: error?.message,
		});

		if (error || !user) {
			console.log("[Hocuspocus] Auth failed:", error?.message);
			throw new Error("Unauthorized: Invalid token");
		}

		return {
			user: {
				id: user.id,
				email: user.email,
			},
		};
	},
});

server.listen().then(() => {
	console.log(`Hocuspocus server running on port ${PORT}`);
});
