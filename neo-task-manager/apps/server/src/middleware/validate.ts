import type { AnyZodObject } from "zod";
import type { RequestHandler } from "express";

export const validateBody =
  (schema: AnyZodObject): RequestHandler =>
  (request, _response, next) => {
    request.body = schema.parse(request.body);
    next();
  };

