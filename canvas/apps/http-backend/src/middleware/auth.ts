import { Request, Response, NextFunction } from "express";
import { supabase } from "@repo/supabase";
import { HttpError } from "@repo/http-core";
import { StatusCodes } from "http-status-codes";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new HttpError("Missing Authorization Header", StatusCodes.UNAUTHORIZED);
    }

    const token = authHeader.split(" ")[1];
    
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new HttpError("Invalid or Expired Token", StatusCodes.UNAUTHORIZED);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};