import { body } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validation';

const amountValidation = body('amount')
  .notEmpty()
  .withMessage('Amount is required')
  .isFloat({ gt: 0 })
  .withMessage('Amount must be a positive number');

export const validateFund = [amountValidation, handleValidationErrors];

export const validateTransfer = [
  amountValidation,

  body('recipient_email')
    .trim()
    .notEmpty()
    .withMessage('Recipient email is required')
    .isEmail()
    .withMessage('Invalid recipient email address')
    .normalizeEmail(),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters'),

  handleValidationErrors,
];

export const validateWithdraw = [amountValidation, handleValidationErrors];
