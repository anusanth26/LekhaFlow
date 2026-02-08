import type { CreateCanvasType } from "@repo/common";
import { HttpError } from "@repo/http-core";
import type { Tables } from "@repo/supabase";
import { StatusCodes } from "http-status-codes";
import { createServiceClient } from "../supabase.server";

const serviceClient = createServiceClient();

const generateSlug = (name: string): string => {
	const base = name
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-");
	return `${base}-${Date.now()}`;
};

export const createCanvasService = async (
	params: CreateCanvasType & { userId: string },
): Promise<Tables<"canvases">> => {
	const { name, isPublic, userId } = params;

	const slug = generateSlug(name);
	const { data, error } = await createServiceClient()
		.from("canvases")
		.insert({
			name,
			slug,
			owner_id: userId,
			is_public: isPublic,
			data: null,
		})
		.select()
		.single();
	if (error) {
		throw new HttpError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
	}

	return data;
};

export const updateCanvasService = async (
	canvasId: string,
	data: string,
): Promise<void> => {
	const { error } = await serviceClient
		.from("canvases")
		.update({ data })
		.eq("id", canvasId);

	if (error) {
		throw new HttpError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
	}
};

export const getCanvasesService = async (
	userId: string,
): Promise<Tables<"canvases">[]> => {
	// 1. Get canvases owned by the user
	const { data: ownedCanvases, error: ownedError } = await serviceClient
		.from("canvases")
		.select("*")
		.eq("owner_id", userId)
		.eq("is_deleted", false)
		.order("updated_at", { ascending: false });

	if (ownedError) {
		throw new HttpError(ownedError.message, StatusCodes.INTERNAL_SERVER_ERROR);
	}

	// 2. Get canvas IDs this user has accessed (but doesn't own) via activity_logs
	const { data: accessLogs } = await serviceClient
		.from("activity_logs")
		.select("canvas_id")
		.eq("user_id", userId)
		.eq("action", "accessed");

	const accessedCanvasIds = [
		...new Set(
			(accessLogs || [])
				.map((log) => log.canvas_id)
				.filter((id) => !ownedCanvases?.some((c) => c.id === id)),
		),
	];

	let sharedCanvases: Tables<"canvases">[] = [];
	if (accessedCanvasIds.length > 0) {
		const { data: shared } = await serviceClient
			.from("canvases")
			.select("*")
			.in("id", accessedCanvasIds)
			.eq("is_deleted", false)
			.order("updated_at", { ascending: false });

		sharedCanvases = shared || [];
	}

	// 3. Merge: owned first, then shared
	return [...(ownedCanvases || []), ...sharedCanvases];
};

export const getCanvasService = async (
	canvasId: string,
): Promise<Tables<"canvases"> | null> => {
	const { data, error } = await serviceClient
		.from("canvases")
		.select("*")
		.eq("id", canvasId)
		.eq("is_deleted", false)
		.maybeSingle();

	if (error) {
		throw new HttpError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
	}

	return data;
};

export const deleteCanvasService = async (
	canvasId: string,
	userId: string,
): Promise<void> => {
	const { error } = await serviceClient
		.from("canvases")
		.update({ is_deleted: true, deleted_at: new Date().toISOString() })
		.eq("id", canvasId)
		.eq("owner_id", userId);

	if (error) {
		throw new HttpError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
	}
};

export const syncUserService = async (user: {
	id: string;
	email: string;
	name: string;
	avatar_url: string | null;
}): Promise<Tables<"users">> => {
	const { data, error } = await serviceClient
		.from("users")
		.upsert(
			{
				id: user.id,
				email: user.email,
				name: user.name,
				avatar_url: user.avatar_url,
				updated_at: new Date().toISOString(),
			},
			{ onConflict: "id" },
		)
		.select()
		.single();

	if (error) {
		throw new HttpError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
	}

	return data;
};
