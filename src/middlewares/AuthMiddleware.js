const jwt = require('jsonwebtoken')
const { check, header } = require('express-validator')
const { showValidation, renewToken } = require('../utils/middlewares')
const connection = require('../database/connection')

async function customAuthValidation (value, req, renew = false){
  const [ schema, token ] = value.split(' ')

  if (!(schema && token ))
    return Promise.reject('schema or token not informed')
  
  if (!(schema === 'Bearer'))
    return Promise.reject('unrecognized schema')
  
  try {
    const decrypted = await jwt.verify(token, process.env.SECRET_KEY, { complete: true })
    const [bannedToken] = await connection('_tokens')
      .select('id', 'created_at', 'isRevoked')
      .where({ userId: decrypted.payload.id, isRevoked: true, token })
      .limit(1)
    
    if(bannedToken)
      return Promise.reject('inactive token')
    
    req.userId = decrypted.payload.id
    req.token = renew ? renewToken(decrypted, token).then((val)=>val) : token
    req.schema = schema
  } catch (error) {
    return Promise.reject(error)
  }
}

const login = [
  check('email').notEmpty().withMessage('email field is required').bail()
    .isEmail().withMessage('is not a valid email'),

  check('password').notEmpty().withMessage('password field is required').bail()
    .isString().withMessage('password field needs to be string'),
  
    showValidation
]

const authOnly = [
  header('authorization').notEmpty().withMessage('this route needs token authentication')
    .isString().withMessage('authorization field must be string')
    .custom((value, {req})=>{
      return customAuthValidation(value, req)
    }),
  
  showValidation
]

const auth = [
  header('authorization').notEmpty().withMessage('this route needs token authentication')
    .isString().withMessage('authorization field must be string')
    .custom(async (value, {req})=>{
      return customAuthValidation(value, req, true)
    }),
  
  showValidation
]

module.exports={ login, auth, authOnly }