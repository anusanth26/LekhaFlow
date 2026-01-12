import { supabase } from "@repo/supabase";
import { HttpError } from "@repo/http-core";
import { StatusCodes } from "http-status-codes";
import { CreateCanvasType } from "@repo/common";
import { Tables } from "@repo/supabase";

const generateSlug = (name: string): string => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-');
  return `${base}-${Date.now()}`;
};


export const createCanvasService = async (params: CreateCanvasType
): Promise<Tables<'canvases'>> => {
  const { name, isPublic, userId } = params;

  const slug = generateSlug(name);
  const { data, error } = await supabase
    .from("canvases")
    .insert({
      name,
      slug,
      owner_id: userId,
      is_public: isPublic,
      data: null
    })
    .select()
    .single();
  if (error) {
    throw new HttpError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return data;
};