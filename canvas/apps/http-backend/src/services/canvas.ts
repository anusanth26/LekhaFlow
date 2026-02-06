import type { CreateCanvasType } from "@repo/common";
import { HttpError } from "@repo/http-core";
import { supabase, type Tables } from "@repo/supabase";
import { StatusCodes } from "http-status-codes";

const generateSlug = (name: string): string => {
	const base = name
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-");
	return `${base}-${Date.now()}`;
};

export const createCanvasService = async (
	params: CreateCanvasType,
): Promise<Tables<"canvases">> => {
	const { name, isPublic, userId } = params;

	const slug = generateSlug(name);
	const { data, error } = await supabase
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
	const { error } = await supabase
		.from("canvases")
		.update({ data })
		.eq("id", canvasId);

	if (error) {
		throw new HttpError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
	}
};

export const getCanvasesService = async (userId: string) => {
	const { data, error } = await supabase
		.from("canvases")
		.select("id, name, updated_at, thumbnail_url")
		.eq("owner_id", userId)
		.eq("is_deleted", false);

	if (error) {
		throw new HttpError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
	}

	return data;
};

export const deleteCanvasService = async (canvasId: string, userId: string) => {
	const { error } = await supabase
		.from("canvases")
		.update({ is_deleted: true })
		.eq("id", canvasId)
		.eq("owner_id", userId);

	if (error) {
		throw new HttpError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
	}
};
