const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const {v4: uuidv4} = require('uuid')
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
        id: uuidv4(),
        token: token, 
        type: 'authentication token', 
        isRevoked: true, 
        userId: tokenDecrypted.payload.id
      })
    return newToken
  }
  return token
}

module.exports= { showValidation, renewToken }