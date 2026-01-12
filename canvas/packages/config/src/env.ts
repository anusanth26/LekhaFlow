import { HttpError } from "@repo/http-core";
import { StatusCodes } from "http-status-codes";

interface EnvVariables {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  NODE_ENV: string;
}

const _env = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  NODE_ENV: process.env.NODE_ENV,
};

for (const [key, value] of Object.entries(_env)) {
  if (!value) {
    throw new HttpError(
      `Environment variable ${key} is not set`,
      StatusCodes.BAD_REQUEST
    );
  }
}

export const env: EnvVariables = _env as EnvVariables;
