const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const connection = require('../database/connection')

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

    // verifica se existe um usuário com o email passasdo
    const [ user ] = await connection('users')
      .select('id', 'email')
      .where({ email })
      .limit(1)
    if(!user)
      return res.status(400).json({ error: { value: email, param: 'email', msg: 'email not found' } })
    
    try {
      // gera um novo token e insere no banco
      const token = jwt.sign(user, process.env.SECRET_KEY, { algorithm: 'HS512' })
      const insertToken = await connection('_tokens')
        .insert(
          { token: token, type: 'password reset token', isRevoked: false, userId: user.id},
          ['id', 'token', 'created_at']
        )
        .catch((error)=>error)

      return res.json({ insertToken }) 
    } catch (error) {
      return res.status(400).json({ error })
    }
  },

  async resetPassword(req, res){
    const { password } = req.body
    const token = req.query.hash

    try {
      // verifica se o token é valido, existe no banco de dados e pertence a este usuário
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY)
      const [checkToken] = await connection('_tokens')
        .select('id')
        .where({ token, type: 'password reset token', isRevoked: false, userId: decodedToken.id })
        .limit(1)
      if(!checkToken)
        return res.status(400).json({ error: { value: token, param: 'token', msg: 'token not found' }})
      
    
      // altera a senha do usuário
      const encryptedPassword = crypto.createHash('sha256').update(password).digest('base64')
      const [updatedUser] = await connection('users')
        .where({ id: decodedToken.id })
        .update({ password: encryptedPassword}, ['id', 'name', 'email'])
        .catch((error)=>error)
      
      //examina possiveis erros
      if((updatedUser.name && updatedUser.name === 'error') && 
        (updatedUser.length && updatedUser.length > 0))
        return res.status(400).json({ error: updatedUser })

      // autentica o usuário
      const loginToken = jwt.sign({id: updatedUser.id }, process.env.SECRET_KEY, { expiresIn: '8h' })
      updatedUser.token = loginToken
      
      // deleta o token usado
      await connection('_tokens').del().where({ id: checkToken.id})

      return res.json( updatedUser )
    } catch (error) {
      return res.status(400).json({ error , ok:true})
    }
  }
}