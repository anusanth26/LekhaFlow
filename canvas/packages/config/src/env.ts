import { HttpError } from "@repo/http-core";
import { StatusCodes } from "http-status-codes";

const _env = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
};

for (const [key, value] of Object.entries(_env)) {
  if (!value) {
    throw new HttpError(
      `Environment variable ${key} is not set`,
      StatusCodes.BAD_REQUEST
    );
  }
}

export const env = _env as { [K in keyof typeof _env]: string };
