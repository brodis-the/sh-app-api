const { validationResult } = require('express-validator')

const showValidation = (req, res, next) => {
  if (!validationResult(req).isEmpty()){
    return res.status(400).json({ errors: validationResult(req).array()})
  } 
  next()
}

module.exports= { showValidation }