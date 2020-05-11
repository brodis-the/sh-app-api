const { check, header, query, validationResult} = require('express-validator')
const { showValidation, customAuthValidation } = require('../utils/middlewares')

const auth = [
  header('authorization').notEmpty().withMessage('this route needs token authentication').bail()
    .isString().withMessage('authorization field must be string').bail()
    .custom(async (value, {req})=>{
      return customAuthValidation(value, req, true)
    }),
  
  (req, res, next) => {
    if (!validationResult(req).isEmpty()){
      return res.status(401).json({ error: validationResult(req).array()[0] })
    } 
    next()
  }
]

const checkToken = [
  query('hash').notEmpty().withMessage('hash field is required').bail()
    .isString().withMessage('hash field is not a string')
    .isLength({min: 196 }).withMessage('hash length is invalid'),

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
  header('authorization').notEmpty().withMessage('this route needs token authentication').bail()
    .isString().withMessage('authorization field must be string').bail()
    .custom((value, {req})=>{
      return customAuthValidation(value, req)
    }),
  
  (req, res, next) => {
    if (!validationResult(req).isEmpty()){
      return res.status(401).json({ error: validationResult(req).array()[0] })
    } 
    next()
  }
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