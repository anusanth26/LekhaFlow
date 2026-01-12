import type { Request, Response } from "express";
import { supabase } from "@repo/supabase";
import { JSONResponse, HttpError } from "@repo/http-core";
import { SignupSchema, SigninSchema } from "../interface/auth.js";
import { StatusCodes } from "http-status-codes";

export const signup = async (req: Request, res: Response) => {
  const parsedData = SignupSchema.safeParse(req.body);
  if (!parsedData.success) {
    throw new HttpError(
      "Validation Failed: " +
        (parsedData.error.issues[0]?.message ?? "Invalid input"),
      StatusCodes.BAD_REQUEST
    );
  }

  const { email, password, name } = parsedData.data;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    throw new HttpError(error.message, StatusCodes.BAD_REQUEST);
  }

  return JSONResponse(
    res,
    StatusCodes.CREATED,
    "User created successfully. Check email for verification.",
    {
      user: data.user,
    }
  );
};

export const signin = async (req: Request, res: Response) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    throw new HttpError(
      "Validation Failed: " +
        (parsedData.error.issues[0]?.message ?? "Invalid input"),
      StatusCodes.BAD_REQUEST
    );
  }

  const { email, password } = parsedData.data;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new HttpError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }
  return JSONResponse(res, StatusCodes.OK, "Signed in successfully", {
    token: data.session.access_token,
    user: data.user,
  });
};
