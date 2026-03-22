import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Reads the result of express-validator checks run before this middleware.
 * If any validation errors exist, responds with 400 and the first error message.
 * This is intentionally placed after validation chains in route definitions.
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      status: 'error',
      message: errors.array()[0].msg,
    });
    return;
  }

  next();
};
