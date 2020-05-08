const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const connection = require('../database/connection')

const showValidation = (req, res, next) => {
  if (!validationResult(req).isEmpty()){
    return res.status(400).json({ errors: validationResult(req).array()})
  } 
  next()
}

const renewToken = async (tokenDecrypted = {}, token = '')=>{
  // create a new token and get current timestamps
  const newToken = jwt.sign({id: tokenDecrypted.payload.id }, process.env.SECRET_KEY, { expiresIn: '8h' })
  const nowTimestamps = jwt.verify(newToken, process.env.SECRET_KEY).iat

  // verify life of the token
  const restOfLife = tokenDecrypted.payload.exp - nowTimestamps 
  if (restOfLife <= 3600){
    await connection('_tokens')
      .insert({ 
        token: token, 
        type: 'authentication token', 
        isRevoked: true, 
        userId: tokenDecrypted.payload.id
      })
    return newToken
  }
  return token
}

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

module.exports= { customAuthValidation, renewToken, showValidation }