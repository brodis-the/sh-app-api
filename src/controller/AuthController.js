const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const connection = require('../database/connection')
const { transport } = require('../config/mail')
const emailOfResetPassword = require('../resources/emails/resetPassword')

module.exports = {
  async login(req, res){
    const { email, password } = req.body

    try {
      const [user] = await connection('users')
        .select('id', 'name', 'email', 'password', 'emailVerifiedAt')
        .where({ email })
        .limit(1)
      
      if(!user)
        return res.status(400).json({ error: { value: email, param: 'email', msg: 'email not found' } })
            
      if (!user.emailVerifiedAt)
        return res.status(400).json({ error: { value: email, param: 'email', msg: 'user email has not yet been verified'} })

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
          id: uuidv4(),
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
          { id: uuidv4(), token: token, type: 'password reset token', isRevoked: false, userId: user.id},
          ['id', 'created_at']
        )

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
      
      // authenticates the user
      const loginToken = jwt.sign({id: updatedUser.id }, process.env.SECRET_KEY, { expiresIn: '8h' })
      updatedUser.token = loginToken
      
      // delete used token
      await connection('_tokens').del().where({ id: checkToken.id})

      return res.json( updatedUser )
    } catch (error) {
      return res.status(400).json({ error })
    }
  },

  async abortResetPassword(req, res){
    const token = req.query.hash
    try{
      // checks if the token is valid, exists in the database and belongs to this user
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY)
      const [checkToken] = await connection('_tokens')
        .select('id')
        .where({ token, type: 'password reset token', isRevoked: false, userId: decodedToken.id })
        .limit(1)
      if(!checkToken)
        return res.status(400).json({ error: { value: token, param: 'token', msg: 'token not found' }})

      // delete reported token 
      await connection('_tokens').del().where({ id: checkToken.id })

      return res.status(204).send()
    }catch(error){
      res.status(400).json({ error })
    }
  },

  async verifyEmail(req, res){
    const token = req.query.hash
    try {
      // checks if the token is valid, owner was been verified, token exists in the database and belongs to this user
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY)
      
      const [user] = await connection('users')
        .leftJoin('_tokens', 'users.id', '_tokens.userId')
        .select('users.emailVerifiedAt', {tokenId: '_tokens.id'} )
        .where('users.id', decodedToken.id)

      if (user.emailVerifiedAt)
        return res.status(400).json({ error: { value: token, param: 'token', msg: 'user email was been verified'} })
      
      if(!user.tokenId)
        return res.status(400).json({ error: { value: token, param: 'token', msg: 'token not found' }})
      
      // add emailVerifyiedAt in database
      const [updatedUser] = await connection('users')
        .select('id', 'created_at')
        .where({ id: decodedToken.id})
        .then(async ([user])=>{
          const updateUser = await connection('users')
          .update(
            { emailVerifiedAt: connection.fn.now(6), updated_at: connection.fn.now(6) },
            [ 'id', 'name', 'email', 'updated_at']
          )
          .where({ id: user.id})
          
          return updateUser
        })

      await connection('_tokens')
        .del()
        .where({ token, type: 'email verification token', isRevoked: false, userId: decodedToken.id })

      // authenticates the user
      const loginToken = jwt.sign({id: updatedUser.id }, process.env.SECRET_KEY, { expiresIn: '8h' })
      updatedUser.token = loginToken
      
      return res.json({ user: updatedUser})
    } catch (error) {
      return res.status(400).json({ error })
    }
  },

  async abortVerifyEmail(req,res){
    const token = req.query.hash
    try {
      // checks if the token is valid, owner was been verified, token exists in the database and belongs to this user
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY)
      
      const [user] = await connection('users')
        .leftJoin('_tokens', 'users.id', '_tokens.userId')
        .select('users.emailVerifiedAt', {tokenId: '_tokens.id'} )
        .where('users.id', decodedToken.id)

      if (user && user.emailVerifiedAt)
        return res.status(400).json({ error: { value: token, param: 'token', msg: 'user email was been verified'} })
      
      if(!user || !user.tokenId)
        return res.status(400).json({ error: { value: token, param: 'token', msg: 'token not found' }})

      // delete user registered with wrong email
      await connection('users')
        .del()
        .where({ id: decodedToken.id})

      return res.status(204).send()
    } catch (error) {
      return res.status(400).json({ error })
    }
  }
}