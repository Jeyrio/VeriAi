import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { createError } from './errorHandler';

/**
 * Middleware to validate request and return errors
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : error.type,
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined,
    }));

    throw createError.badRequest('Validation failed', errorMessages);
  }

  next();
};

/**
 * AI Generation validation rules
 */
export const validateAIGeneration = [
  body('prompt')
    .isString()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Prompt must be a string between 1 and 10000 characters'),
  
  body('model')
    .isString()
    .trim()
    .isIn(['gpt-4-turbo-preview', 'gpt-3.5-turbo', 'gemini-1.5-flash', 'gemini-1.5-pro'])
    .withMessage('Invalid AI model specified'),
  
  body('userAddress')
    .isString()
    .trim()
    .isLength({ min: 42, max: 42 })
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address'),
  
  body('maxTokens')
    .optional()
    .isInt({ min: 1, max: 4096 })
    .withMessage('Max tokens must be between 1 and 4096'),
  
  body('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('Temperature must be between 0 and 2'),
  
  validateRequest,
];

/**
 * Verification submission validation rules
 */
export const validateVerificationSubmission = [
  body('prompt')
    .isString()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Prompt must be a string between 1 and 10000 characters'),
  
  body('output')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50000 })
    .withMessage('Output must be a string between 1 and 50000 characters'),
  
  body('model')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Model is required'),
  
  body('outputHash')
    .isString()
    .trim()
    .isLength({ min: 64, max: 64 })
    .matches(/^[a-fA-F0-9]{64}$/)
    .withMessage('Invalid output hash format'),
  
  body('userAddress')
    .isString()
    .trim()
    .isLength({ min: 42, max: 42 })
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address'),
  
  body('signature')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Signature is required'),
  
  validateRequest,
];

/**
 * Attestation verification validation rules
 */
export const validateAttestationVerification = [
  body('attestationData')
    .notEmpty()
    .withMessage('Attestation data is required'),
  
  body('merkleProof')
    .isArray()
    .withMessage('Merkle proof must be an array'),
  
  validateRequest,
];

/**
 * Challenge verification validation rules
 */
export const validateChallengeVerification = [
  body('challengerAddress')
    .isString()
    .trim()
    .isLength({ min: 42, max: 42 })
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid challenger address'),
  
  body('reason')
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Reason must be between 10 and 1000 characters'),
  
  body('evidence')
    .notEmpty()
    .withMessage('Evidence is required'),
  
  validateRequest,
];

/**
 * NFT minting validation rules
 */
export const validateNFTMinting = [
  body('userAddress')
    .isString()
    .trim()
    .isLength({ min: 42, max: 42 })
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid user address'),
  
  body('prompt')
    .isString()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Prompt must be between 1 and 10000 characters'),
  
  body('output')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50000 })
    .withMessage('Output must be between 1 and 50000 characters'),
  
  body('model')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Model is required'),
  
  body('verificationId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Verification ID is required'),
  
  body('metadataURI')
    .isString()
    .trim()
    .isURL()
    .withMessage('Invalid metadata URI'),
  
  validateRequest,
];

/**
 * Pagination validation rules
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  validateRequest,
];

/**
 * Ethereum address validation
 */
export const validateEthereumAddress = [
  param('userAddress')
    .isString()
    .trim()
    .isLength({ min: 42, max: 42 })
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address'),
  
  validateRequest,
];

/**
 * ID parameter validation
 */
export const validateId = [
  param('id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('ID parameter is required'),
  
  validateRequest,
];

/**
 * Token ID validation
 */
export const validateTokenId = [
  param('tokenId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Token ID is required'),
  
  validateRequest,
];

/**
 * Verification ID validation
 */
export const validateVerificationId = [
  param('verificationId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Verification ID is required'),
  
  validateRequest,
];

/**
 * Request ID validation
 */
export const validateRequestId = [
  param('requestId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Request ID is required'),
  
  validateRequest,
];

/**
 * AI output validation
 */
export const validateAIOutput = [
  body('prompt')
    .isString()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Prompt must be between 1 and 10000 characters'),
  
  body('output')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50000 })
    .withMessage('Output must be between 1 and 50000 characters'),
  
  body('model')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Model is required'),
  
  body('expectedHash')
    .isString()
    .trim()
    .isLength({ min: 64, max: 64 })
    .matches(/^[a-fA-F0-9]{64}$/)
    .withMessage('Invalid expected hash format'),
  
  validateRequest,
];

/**
 * FDC attestation submission validation
 */
export const validateFDCAttestationSubmission = [
  body('verificationId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Verification ID is required'),
  
  body('attestationData')
    .notEmpty()
    .withMessage('Attestation data is required'),
  
  body('merkleRoot')
    .isString()
    .trim()
    .isLength({ min: 64, max: 64 })
    .matches(/^[a-fA-F0-9]{64}$/)
    .withMessage('Invalid merkle root format'),
  
  body('signature')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Signature is required'),
  
  validateRequest,
];
