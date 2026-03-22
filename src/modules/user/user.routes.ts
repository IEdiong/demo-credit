import { Router } from 'express';
import * as UserController from './user.controller';
import { validateRegister, validateLogin } from './user.validator';

const router = Router();

router.post('/register', validateRegister, UserController.register);
router.post('/login', validateLogin, UserController.login);

export default router;
