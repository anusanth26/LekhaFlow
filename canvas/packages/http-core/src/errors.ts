  import { StatusCodes } from "http-status-codes";
  import { logger } from "@repo/logger";

  export class HttpError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
      super(message);
      this.name = "HttpError";

      if (typeof statusCode !== "number" || statusCode < 100 || statusCode >= 600) {
        logger.info(`[HttpError] Invalid statusCode "${statusCode}" provided. Defaulting to 500.`);
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      }

      this.statusCode = statusCode;
      Error.captureStackTrace(this, this.constructor);
    }
  }
