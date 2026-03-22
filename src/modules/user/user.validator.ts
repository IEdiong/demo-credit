import { body } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validation';

export const validateRegister = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),

  body('lastName').trim().notEmpty().withMessage('Last name is required'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),

  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),

  handleValidationErrors,
];
