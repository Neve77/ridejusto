/**
 * Validadores Joi para todas as formas de entrada
 */
import Joi from 'joi'
import { VALIDATION_CONFIG } from '@/constants'

/* ========== Auth Validators ========== */
export const authValidators = {
  login: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'Email deve ser um endereço de email válido',
        'any.required': 'Email é obrigatório',
      }),
    password: Joi.string()
      .min(VALIDATION_CONFIG.minPasswordLength)
      .required()
      .messages({
        'string.min': `Senha deve ter no mínimo ${VALIDATION_CONFIG.minPasswordLength} caracteres`,
        'any.required': 'Senha é obrigatória',
      }),
  }),

  register: Joi.object({
    name: Joi.string()
      .min(VALIDATION_CONFIG.minNameLength)
      .max(VALIDATION_CONFIG.maxNameLength)
      .required()
      .messages({
        'string.min': `Nome deve ter no mínimo ${VALIDATION_CONFIG.minNameLength} caracteres`,
        'string.max': `Nome deve ter no máximo ${VALIDATION_CONFIG.maxNameLength} caracteres`,
        'any.required': 'Nome é obrigatório',
      }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'Email deve ser um endereço válido',
        'any.required': 'Email é obrigatório',
      }),
    password: Joi.string()
      .min(VALIDATION_CONFIG.minPasswordLength)
      .max(VALIDATION_CONFIG.maxPasswordLength)
      .pattern(VALIDATION_CONFIG.validPasswordRegex)
      .required()
      .messages({
        'string.min': `Senha deve ter no mínimo ${VALIDATION_CONFIG.minPasswordLength} caracteres`,
        'string.max': `Senha deve ter no máximo ${VALIDATION_CONFIG.maxPasswordLength} caracteres`,
        'string.pattern.base': 'Senha deve conter letras maiúsculas, minúsculas, números e símbolos especiais',
        'any.required': 'Senha é obrigatória',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Senhas não conferem',
        'any.required': 'Confirmação de senha é obrigatória',
      }),
    role: Joi.string()
      .valid('passenger', 'driver')
      .required()
      .messages({
        'any.only': 'Tipo de usuário inválido',
        'any.required': 'Tipo de usuário é obrigatório',
      }),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(VALIDATION_CONFIG.minPasswordLength)
      .pattern(VALIDATION_CONFIG.validPasswordRegex)
      .required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required(),
  }),
}

/* ========== Ride Validators ========== */
export const rideValidators = {
  requestRide: Joi.object({
    origin: Joi.string()
      .min(3)
      .max(256)
      .required()
      .messages({
        'string.min': 'Origem deve ter no mínimo 3 caracteres',
        'string.max': 'Origem muito longa',
        'any.required': 'Origem é obrigatória',
      }),
    destination: Joi.string()
      .min(3)
      .max(256)
      .required()
      .messages({
        'string.min': 'Destino deve ter no mínimo 3 caracteres',
        'string.max': 'Destino muito longo',
        'any.required': 'Destino é obrigatório',
      }),
    distanceKm: Joi.number()
      .positive()
      .max(500)
      .required()
      .messages({
        'number.positive': 'Distância deve ser um número positivo',
        'number.max': 'Distância máxima é 500 km',
        'any.required': 'Distância é obrigatória',
      }),
    paymentMethod: Joi.string()
      .valid('cash', 'card', 'wallet')
      .required()
      .messages({
        'any.only': 'Método de pagamento inválido',
        'any.required': 'Método de pagamento é obrigatório',
      }),
  }),

  filterRides: Joi.object({
    status: Joi.string()
      .valid('pending', 'accepted', 'in_progress', 'completed', 'cancelled')
      .optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
  }),

  rateRide: Joi.object({
    rideId: Joi.number().required(),
    rating: Joi.number()
      .min(1)
      .max(5)
      .required()
      .messages({
        'number.min': 'Avaliação deve ser no mínimo 1',
        'number.max': 'Avaliação deve ser no máximo 5',
        'any.required': 'Avaliação é obrigatória',
      }),
    comment: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Comentário não pode ter mais de 500 caracteres',
      }),
  }),
}

/* ========== Profile Validators ========== */
export const profileValidators = {
  updateProfile: Joi.object({
    name: Joi.string()
      .min(VALIDATION_CONFIG.minNameLength)
      .max(VALIDATION_CONFIG.maxNameLength)
      .optional(),
    phone: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Telefone deve ter entre 10 e 15 dígitos',
      }),
    bio: Joi.string()
      .max(500)
      .optional(),
  }),

  updateVehicle: Joi.object({
    licensePlate: Joi.string()
      .pattern(/^[A-Z]{3}-?[0-9]{4}$/)
      .required()
      .messages({
        'string.pattern.base': 'Placa deve estar no formato AAA-1234',
      }),
    model: Joi.string()
      .max(100)
      .required(),
    year: Joi.number()
      .min(2000)
      .max(new Date().getFullYear() + 1)
      .required(),
  }),
}

/* ========== Generic Validators ========== */
export const validateForm = (schema: Joi.ObjectSchema, data: unknown) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  })

  if (error) {
    const errors: Record<string, string[]> = {}
    error.details.forEach((detail: Joi.ValidationErrorItem) => {
      const key = detail.path.join('.')
      if (!errors[key]) {
        errors[key] = []
      }
      errors[key].push(detail.message)
    })
    return { valid: false, errors, value: null }
  }

  return { valid: true, errors: undefined, value }
}

export const validateField = (schema: Joi.Schema, value: unknown) => {
  const { error } = schema.validate(value, {
    abortEarly: true,
  })
  return !error
}

export const getFieldErrors = (schema: Joi.ObjectSchema, data: unknown, field: string) => {
  const { error } = schema.validate(data, {
    abortEarly: false,
  })

  if (!error) return undefined

  return error.details
    .filter((detail: Joi.ValidationErrorItem) => detail.path.join('.') === field)
    .map((detail: Joi.ValidationErrorItem) => detail.message)
}
