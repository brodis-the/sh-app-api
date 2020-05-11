const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const connection = require('../database/connection')
const { transport } = require('../config/mail')
const verifyEmail = require('../resources/emails/verifyEmail')

module.exports = {
  async index (req, res) {
    users = await connection('users')
      .select('id', 'name', 'cpf', 'email', 'phone', 'emailVerifiedAt', 'created_at', 'updated_at')
      .orderBy('created_at')

    return res.json( users )
  },

  async show(req, res){
    const { id } = req.params

    let user = await connection('users')
      .select('id', 'name', 'cpf', 'email', 'phone', 'emailVerifiedAt', 'created_at', 'updated_at')
      .where({ id })

    if( user[0] ){
      const business = await connection('business').select('*').where({ userId: id })
      user[0].business = business
    } else {
      return res.status(404)
        .json({ error: 404, message: 'user not found!' })
    }
    return res.json( user )
  },

  async store(req, res){
    const {name, cpf, email, password, phone} = req.body

    try {
      const encryptedPassword = crypto.createHash('sha256').update(password).digest('base64')
      const user = await connection('users')
        .insert({ name, cpf, email, password: encryptedPassword, phone },
          [ 'id', 'name', 'cpf', 'email', 'phone', 'created_at', 'updated_at'])
        .then(async([user])=>{
          // generates a new token and inserts it into the bank
          const token = jwt.sign({id: user.id, email: user.email}, process.env.SECRET_KEY, { algorithm: 'HS512' })
          this.token = token
          const [insertToken] = await connection('_tokens')
            .insert(
              { token: token, type: 'email verification token', userId: user.id},
              ['id', 'created_at']
            )
          user.token = insertToken
          return user
        })

      // sending verification of email
      const receiver = { name: user.name, address: user.email}
      transport.sendMail(verifyEmail(receiver, token), function(error, info){
        if (error) {
          return res.status(400).json({ error })
        }
        user.mailVerification = {
          destination: info.accepted[0],
          messageId: info.messageId,
          response: info.response,
        }
        return res.json({ user })
      })
    } catch (error) {
      if(error.name === 'error' && error.constraint)
        return res.status(400).json({ error: { value: email, param: 'email', msg: 'email has already been registered' } })
      return res.status(400).json({error})
    }
  },

  async update(req, res){
    const { id } = req.params
    const {name, cpf, email, phone} = req.body
    const user = await connection('users')
      .where({ id })
      .update({ name, cpf, email, phone })
      .then(async () => {
        const result = await connection('users')
        .where({ id })
        .update(
          { updated_at: connection.fn.now(6) },
          [ 'name', 'cpf', 'email', 'phone', 'updated_at']
        )
        return result
      })
      .catch(function(error) { 
        return res.json({ error }) 
      })
    
    return res.json( user )
  },
  
  async destroy(req, res){
    const { id } = req.params 
    await connection('users')
      .where({ id })
      .del()
      .catch(function(error) { 
        return res.json({ error }) 
      })

    return res.status(204).send()
  },
}