const { check, param } = require('express-validator')
const { showValidation } = require('../utils/middlewares')

const show = [
    param('id').isInt().withMessage('The id param is not a Integer'),

    showValidation
  ]

const store = [
    check('name').notEmpty().withMessage('name field is required').bail()
      .isString().withMessage('name field needs to be string').bail()
      .isAlpha('pt-BR').withMessage(' name field needs to be alphabetic'),

    check('cpf').notEmpty().withMessage('cpf field is required').bail()
      .isString().withMessage('cpf field needs to be string').bail()
      .isWhitelisted('0123456789.-').withMessage('cpf field must contain only numbers').bail()
      .isLength({min:11, max: 14}).withMessage('cpf length is invalid'),

    check('email').notEmpty().withMessage('email field is required').bail()
      .isEmail().withMessage('is not a valid email'),

    check('phone').notEmpty().withMessage('phone field is required').bail()
      .isWhitelisted('0123456789+- ').withMessage('phone field must contain only numbers').bail()
      .isLength({min: 8, max: 17}).withMessage('phone length is invalid'),
      
    showValidation,
  ]

const update = [
    param('id')
      .isInt().withMessage('The id param is not a Integer'),

    check('name')
      .isString().withMessage('name field needs to be string')
      .isAlpha('pt-BR').withMessage(' name field needs to be alphabetic')
      .optional(),

    check('cpf')
      .isString().withMessage('cpf field needs to be string')
      .isWhitelisted('0123456789.-').withMessage('cpf field must contain only numbers')
      .isLength({min:11, max: 14}).withMessage('cpf length is invalid')
      .optional(),

    check('email')
      .isEmail().withMessage('is not a valid email')
      .optional(),

    check('phone')
      .isWhitelisted('0123456789+- ').withMessage('phone field must contain only numbers')
      .isLength({min: 8, max: 17}).withMessage('phone length is invalid')
      .optional(),

    showValidation
  ]

const destroy = [
    param('id').isInt().withMessage('The id param is not a Integer'),

    showValidation
  ]


module.exports= { show, store, update, destroy }