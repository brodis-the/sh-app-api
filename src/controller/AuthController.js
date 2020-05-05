const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const connection = require('../database/connection')

module.exports = {
  async login(req, res){
    const { email, password } = req.body

    try {
      const [user] = await connection('users')
        .select('id', 'email', 'password')
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
    const [ schema, token ] = req.headers.authorization.split(' ')
    const decrypted = await jwt.verify(token, process.env.SECRET_KEY, { complete: true })

    try {
      await connection('_tokens')
        .insert({ 
          token: token, 
          type: 'authentication token', 
          isRevoked: true, 
          userId: decrypted.payload.id
        })
      return res.status(204).send()
    } catch (error) {
      return res.json({ error })
    }
  },

}