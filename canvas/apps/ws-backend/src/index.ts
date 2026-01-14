/**
 * ============================================================================
 * LEKHAFLOW WS BACKEND - HOCUSPOCUS SERVER
 * ============================================================================
 *
 * Real-time collaboration server using Hocuspocus (Yjs framework).
 * Handles document sync, persistence, and authentication.
 */

// Load environment variables FIRST (before any imports that access process.env)
import "./env.js";

import { Database } from "@hocuspocus/extension-database";
import { Logger } from "@hocuspocus/extension-logger";
import { Server } from "@hocuspocus/server";
import { env } from "@repo/config";
import { createClient } from "@supabase/supabase-js";

// ============================================================================
// SUPABASE ADMIN CLIENT
// ============================================================================

/**
 * Admin client using service key to bypass RLS.
 * Required for server-side persistence on behalf of authenticated users.
 */
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

// ============================================================================
// SERVER CONFIGURATION
// ============================================================================

const PORT = parseInt(process.env.PORT || process.env.WS_PORT || "8080", 10);

const server = Server.configure({
	port: PORT,

	extensions: [
		new Logger(),
		new Database({
			/**
			 * Load document from Supabase
			 * Called when a client connects to a document
			 */
			fetch: async ({ documentName }) => {
				const { data, error } = await supabase
					.from("canvases")
					.select("data")
					.eq("id", documentName)
					.single();

				if (error) {
					console.error("[Hocuspocus] Error fetching canvas:", error.message);
					return null;
				}

				return data?.data ?? null;
			},

			/**
			 * Save document to Supabase
			 * Called periodically and when all clients disconnect
			 */
			store: async ({ documentName, state }) => {
				const { error } = await supabase
					.from("canvases")
					.update({
						data: state,
						updated_at: new Date().toISOString(),
					})
					.eq("id", documentName);

				if (error) {
					console.error("[Hocuspocus] Error saving canvas:", error.message);
				}
			},
		}),
	],

	/**
	 * Authentication hook
	 * Validates JWT token from client connection
	 */
	async onAuthenticate(data) {
		const { token } = data;

		if (!token) {
			throw new Error("Unauthorized: No token provided");
		}

		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token);

		if (error || !user) {
			throw new Error("Unauthorized: Invalid token");
		}

		// Return user info to attach to the connection context
		return {
			user: {
				id: user.id,
				email: user.email,
			},
		};
	},
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

server.listen().then(() => {
	console.log(`🚀 Hocuspocus server running on port ${PORT}`);
});
