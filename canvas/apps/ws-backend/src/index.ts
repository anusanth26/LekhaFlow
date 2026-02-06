import "./env.js";

import { Database } from "@hocuspocus/extension-database";
import { Logger } from "@hocuspocus/extension-logger";
import { Server } from "@hocuspocus/server";
import { serverEnv } from "@repo/config";
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
					.single();

				if (error) {
					console.error("[Hocuspocus] Error fetching canvas:", error.message);
					return null;
				}

				return data?.data ?? null;
			},

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
