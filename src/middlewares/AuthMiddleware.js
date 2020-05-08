const jwt = require('jsonwebtoken')
const { check, header, query } = require('express-validator')
const { showValidation, customAuthValidation } = require('../utils/middlewares')

const auth = [
  header('authorization').notEmpty().withMessage('this route needs token authentication')
    .isString().withMessage('authorization field must be string')
    .custom(async (value, {req})=>{
      return customAuthValidation(value, req, true)
    }),
  
  showValidation
]

const checkToken = [
  query('hash').notEmpty().withMessage('hash field is required').bail()
    .isString().withMessage('hash field is not a string')
    .isLength({min: 196 , max: 196}).withMessage('hash length is invalid'),

    showValidation
]

const forgot = [
  check('email').notEmpty().withMessage('email field is required').bail()
    .isEmail().withMessage('this is not a valid email'),

  showValidation
]

const login = [
  check('email').notEmpty().withMessage('email field is required').bail()
    .isEmail().withMessage('is not a valid email'),

  check('password').notEmpty().withMessage('password field is required').bail()
    .isString().withMessage('password field needs to be string'),
  
  showValidation
]

const logout = [
  header('authorization').notEmpty().withMessage('this route needs token authentication')
    .isString().withMessage('authorization field must be string')
    .custom((value, {req})=>{
      return customAuthValidation(value, req)
    }),
  
  showValidation
]

const resetPassword = [
  query('hash').notEmpty().withMessage('hash field is required').bail()
    .isString().withMessage('hash field is not a string')
    .isLength({min: 196 , max: 196}).withMessage('hash length is invalid'),

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
  
  showValidation
]

module.exports={ auth, checkToken, forgot, login, logout, resetPassword}