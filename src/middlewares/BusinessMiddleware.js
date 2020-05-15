const { param, check } = require('express-validator')
const { showValidation } = require('../utils/middlewares')
const connection = require('../database/connection')

const show = [
  param('id').isUUID('4').withMessage('id param is not a valid ID'),

  showValidation
]

const store = [
  check('businessTitle').notEmpty().withMessage('businessTitle field is required').bail()
    .isString().withMessage('name field needs to be string'),
  check('description')
    .isString().withMessage('description field needs to be string')
    .optional({ nullable: true }),
  check('phone').notEmpty().withMessage('phone field is required').bail()
    .isWhitelisted('0123456789+- ').withMessage('phone field must contain only numbers').bail()
    .isLength({min: 8, max: 17}).withMessage('phone length is invalid'),
  check('street')
    .isString().withMessage('street field needs to be string')
    .optional({ nullable: true }),
  check('neighborhood')
    .isString().withMessage('neighborhood field needs to be string')
    .optional({ nullable: true }),
  check('zipCode')
    .isLength({min: 8, max: 9}).withMessage('zipCode length is invalid, the lengh needs to be between 8 and 9 characters')
    .optional({ nullable: true }),
  check('coordinates')
    .isString().withMessage('coordinates field needs to be string').bail()
    .isWhitelisted('0123456789,.°-NW ').withMessage('coordinates fields contains characters not indentified').bail()
    .optional({ nullable: true }),

  showValidation
]

const update = [
  check('businessTitle')
    .isString().withMessage('name field needs to be string')
    .optional({ nullable: true }),
  check('description')
    .isString().withMessage('description field needs to be string')
    .optional({ nullable: true }),
  check('phone')
    .isWhitelisted('0123456789+- ').withMessage('phone field must contain only numbers').bail()
    .isLength({min: 8, max: 17}).withMessage('phone length is invalid')
    .optional({ nullable: true }),
  check('street')
    .isString().withMessage('street field needs to be string')
    .optional({ nullable: true }),
  check('neighborhood')
    .isString().withMessage('neighborhood field needs to be string')
    .optional({ nullable: true }),
  check('zipCode')
    .isLength({min: 8, max: 9}).withMessage('zipCode length is invalid, the lengh needs to be between 8 and 9 characters')
    .optional({ nullable: true }),
  check('coordinates')
    .isString().withMessage('coordinates field needs to be string').bail()
    .isWhitelisted('0123456789,.°-NW ').withMessage('coordinates fields contains characters not indentified').bail()
    .optional({ nullable: true }),

  showValidation
]

const destroy = [
  param('id').isUUID('4').withMessage('id param is not a valid ID'),

  showValidation
]

module.exports = { show, store, update, destroy }