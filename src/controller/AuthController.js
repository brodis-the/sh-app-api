const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const connection = require('../database/connection')
const { transport } = require('../config/mail')
const emailOfResetPassword = require('../resources/emails/resetPassword')

module.exports = {
  async login(req, res){
    const { email, password } = req.body

    try {
      const [user] = await connection('users')
        .select('id', 'name', 'email', 'password')
        .where({ email })
        .limit(1)
      
      if(!user){
        return res.status(400).json({ error: { msg: 'email not found', param: 'email', value: email } })
      }

      const encryptedPassword = crypto.createHash('sha256').update(password).digest('base64')
      if(!(encryptedPassword === user.password)){
        return res.status(400).json({ error: { msg: 'invalid password', param: 'password', value: password } })
      }

      const token = jwt.sign({id: user.id }, process.env.SECRET_KEY, { expiresIn: '8h' })
      user.password = undefined
      user.token = token

      return res.json( user )
    } catch (error) {
      return res.status(400).json({ error: { msg: 'invalid or malformed request', param: 'email', value: email, error } })
    }
  },

  async logout(req, res){
    try {
      await connection('_tokens')
        .insert({ 
          token: req.token, 
          type: 'authentication token', 
          isRevoked: true, 
          userId: req.userId
        })
      return res.status(204).send()
    } catch (error) {
      return res.json({ error })
    }
  },

  async forgotPassword(req, res){
    const {email} = req.body

    // checks if there is a user with the past email
    const [ user ] = await connection('users')
      .select('id', 'name', 'email')
      .where({ email })
      .limit(1)
    if(!user)
      return res.status(400).json({ error: { value: email, param: 'email', msg: 'email not found' } })
    
    try {
      // generates a new token and inserts it into the bank
      const token = jwt.sign({id: user.id, email: user.email}, process.env.SECRET_KEY, { algorithm: 'HS512' })
      const [insertToken] = await connection('_tokens')
        .insert(
          { token: token, type: 'password reset token', isRevoked: false, userId: user.id},
          ['id', 'created_at']
        )
        .catch((error)=>error)

      // sends an email to the user
      const receiver = { name: user.name, address: user.email}

      transport.sendMail(emailOfResetPassword(receiver, token), function(error, info){
        if (error) {
          return res.status(400).json({ error })
        }
        insertToken.mail = {destination: info.accepted[0], messageId: info.messageId, response: info.response}

        return res.json({ forgot: insertToken })
      })
    } catch (error) {
      return res.status(400).json({ error })
    }
  },

  async resetPassword(req, res){
    const { password } = req.body
    const token = req.query.hash

    try {
      // checks if the token is valid, exists in the database and belongs to this user
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY)
      const [checkToken] = await connection('_tokens')
        .select('id')
        .where({ token, type: 'password reset token', isRevoked: false, userId: decodedToken.id })
        .limit(1)
      if(!checkToken)
        return res.status(400).json({ error: { value: token, param: 'token', msg: 'token not found' }})
      
    
      // alter user password
      const encryptedPassword = crypto.createHash('sha256').update(password).digest('base64')
      const [updatedUser] = await connection('users')
        .where({ id: decodedToken.id })
        .update({ password: encryptedPassword}, ['id', 'name', 'email'])
        .catch((error)=>error)
      
      // examines possible errors
      if((updatedUser.name && updatedUser.name === 'error') && 
        (updatedUser.length && updatedUser.length > 0))
        return res.status(400).json({ error: updatedUser })

      // authenticates the user
      const loginToken = jwt.sign({id: updatedUser.id }, process.env.SECRET_KEY, { expiresIn: '8h' })
      updatedUser.token = loginToken
      
      // delete used token
      await connection('_tokens').del().where({ id: checkToken.id})

      return res.json( updatedUser )
    } catch (error) {
      return res.status(400).json({ error , ok:true})
    }
  }
}