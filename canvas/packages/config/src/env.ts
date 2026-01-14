import { HttpError } from "@repo/http-core";
import { StatusCodes } from "http-status-codes";

interface EnvVariables {
	SUPABASE_URL: string;
	SUPABASE_ANON_KEY: string;
	SUPABASE_SERVICE_KEY: string;
	NODE_ENV: string;
	NEXT_PUBLIC_SUPABASE_URL: string;
	NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

const _env = {
	SUPABASE_URL: process.env.SUPABASE_URL,
	SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
	SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
	NODE_ENV: process.env.NODE_ENV,
	NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
	NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

for (const [key, value] of Object.entries(_env)) {
	if (!value) {
		throw new HttpError(
			`Environment variable ${key} is not set`,
			StatusCodes.BAD_REQUEST,
		);
	}
}

export const env: EnvVariables = _env as EnvVariables;
