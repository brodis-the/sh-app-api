const { body, check, param } = require('express-validator')
const { showValidation } = require('../utils/middlewares')

const show = [
  param('nickname').isString().withMessage('param nickname needs to be string'),

  showValidation
]

const store = [
  check('name').notEmpty().withMessage('name field is required').bail()
    .isString().withMessage('name field needs to be string').bail()
    .isAlpha('pt-BR').withMessage(' name field needs to be alphabetic'),

  check('cpf')
    .isString().withMessage('cpf field needs to be string').bail()
    .isWhitelisted('0123456789.-').withMessage('cpf field must contain only numbers').bail()
    .isLength({min:11, max: 14}).withMessage('cpf length is invalid')
    .optional({ nullable: true }),

  check('email').notEmpty().withMessage('email field is required').bail()
    .isEmail().withMessage('is not a valid email'),

  check('password').notEmpty().withMessage('password field is required').bail()
    .isString().withMessage('password field needs to be string').bail(),
  
  check('passwordConfirmation').notEmpty().withMessage('passwordConfirmation field is required').bail()
    .isString().withMessage('password field needs to be string').bail()
    .custom((value, { req })=>{
      if (value != req.body.password) {
        return Promise.reject('Password confirmation does not match password');
      }
      return true
    }),

  check('phone')
    .isWhitelisted('0123456789+- ').withMessage('phone field must contain only numbers').bail()
    .isLength({min: 8, max: 17}).withMessage('phone length is invalid')
    .optional({ nullable: true }),
    
  showValidation,
]

const update = [
  param('nickname')
    .isString().withMessage('param nickname needs to be string'),

  check('name')
    .isString().withMessage('name field needs to be string')
    .isAlpha('pt-BR').withMessage(' name field needs to be alphabetic')
    .optional(),

  body('nickname')
    .isString().withMessage('nickname field needs to be string')
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
  param('id').isUUID('4').withMessage('The id param is not a valid ID'),

  showValidation
]


module.exports= { show, store, update, destroy }