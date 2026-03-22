import { Request, Response, NextFunction } from 'express';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10,15}$/;

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { first_name, last_name, email, phone_number, password } = req.body;

  if (!first_name || !last_name || !email || !phone_number || !password) {
    res
      .status(400)
      .json({ status: 'error', message: 'All fields are required' });
    return;
  }

  if (!EMAIL_REGEX.test(email)) {
    res.status(400).json({ status: 'error', message: 'Invalid email address' });
    return;
  }

  if (!PHONE_REGEX.test(phone_number)) {
    res.status(400).json({ status: 'error', message: 'Invalid phone number' });
    return;
  }

  if (password.length < 6) {
    res
      .status(400)
      .json({
        status: 'error',
        message: 'Password must be at least 6 characters',
      });
    return;
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res
      .status(400)
      .json({ status: 'error', message: 'Email and password are required' });
    return;
  }

  if (!EMAIL_REGEX.test(email)) {
    res.status(400).json({ status: 'error', message: 'Invalid email address' });
    return;
  }

  next();
};
