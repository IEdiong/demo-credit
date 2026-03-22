import { Request, Response } from 'express';
import * as UserService from './user.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await UserService.registerUser(req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ status: 'error', message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await UserService.loginUser(req.body);
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ status: 'error', message });
  }
};
