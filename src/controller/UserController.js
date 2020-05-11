const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const {v4: uuidv4} = require('uuid')
const connection = require('../database/connection')
const { transport } = require('../config/mail')
const verifyEmail = require('../resources/emails/verifyEmail')

module.exports = {
  async index (req, res) {
    users = await connection('users')
      .select('id', 'name', 'nickname', 'cpf', 'email', 'phone', 'emailVerifiedAt', 'createdAt', 'updatedAt')
      .orderBy('createdAt')

    return res.json( users )
  },

  async show(req, res){
    const { nickname } = req.params

    try {
      let [user] = await connection('users')
        .select('id', 'name', 'nickname', 'cpf', 'email', 'phone', 'emailVerifiedAt', 'createdAt', 'updatedAt')
        .where({ nickname })

      if( user ){
        const business = await connection('business').select('*').where({ userId: user.id })
        user.business = business
      } else {
        return res.status(404).json({ error: {  value: nickname, param: 'nickname', msg: 'user not found!'} })
      }

      return res.json( user )
    } catch (error) {
      return res.status(400).json({ error })
    }
  },

  async store(req, res){
    const {name, cpf, email, password, phone} = req.body

    try {
      // verify if this nick exist in the database
      let nickname = email.split('@')[0]
      const [verifyNickname] = await connection('users').select('id').where({ nickname }).limit(1)
      if (verifyNickname){
        do {
          nickWithRandom = nickname + crypto.randomBytes(2).toString('HEX')
          const [secondVerifyNickname] = await connection('users').select('id').where({ nickname: nickWithRandom }).limit(1)
          if (!secondVerifyNickname)
            nickname = nickWithRandom
        } while (nickname != nickWithRandom);
      }

      const encryptedPassword = crypto.createHash('sha256').update(password).digest('base64')
      const user = await connection('users')
        .insert({ id: uuidv4(), name, nickname, cpf, email, password: encryptedPassword, phone },
          [ 'id', 'name', 'nickname', 'cpf', 'email', 'phone', 'createdAt', 'updatedAt'])
        .then(async([user])=>{
          // generates a new token and inserts it into the bank
          this.token = jwt.sign({id: user.id, email: user.email}, process.env.SECRET_KEY, { algorithm: 'HS512' })
          const [insertToken] = await connection('_tokens')
            .insert({ id: uuidv4(), token: this.token, type: 'email verification token', userId: user.id},
              ['id', 'createdAt'])
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
        return res.json( user )
      })
    } catch (error) {
      if(error.name === 'error' && error.constraint)
        return res.status(400).json({ error: { value: email, param: 'email', msg: 'email has already been registered' } })
      await connection('users').where({ email }).del()
      return res.status(400).json({error})
    }
  },

  async update(req, res){
    let {name, nickname, cpf, email, phone} = req.body
    const paramNickname = req.params.nickname
    const userId = req.userId

    try {
      //verify authorizathion of the user logged
      const [authorized] = await connection('users').select('id').where({ id: userId })

      if(!authorized)
        return res.status(401).json({ value: nickname, param: 'nickname', msg: ' user is not authorized for this action'})

      // verify if this nick exist in the database
      if (nickname){
        const [verifyNickname] = await connection('users').select('id').where({ nickname }).limit(1)
        if (verifyNickname){
          do {
            nickWithRandom = nickname + crypto.randomBytes(2).toString('HEX')
            const [secondVerifyNickname] = await connection('users').select('id').where({ nickname: nickWithRandom }).limit(1)
            if (!secondVerifyNickname)
              nickname = nickWithRandom
          } while (nickname != nickWithRandom);
        }
      }

      const user = await connection('users')
        .where({ nickname: paramNickname })
        .update({ name, nickname, cpf, email, phone })
        .then(async () => {
          const result = await connection('users')
          .where({ nickname: paramNickname })
          .update(
            { updatedAt: connection.fn.now(6) },
            [ 'name', 'nickname', 'cpf', 'email', 'phone', 'updatedAt']
          )
          return result
        })
      
      return res.json( user )
    } catch (error) {
      if(error.name === 'error' && error.constraint === 'users_email_unique')
        return res.status(400).json({ error: { value: email, param: 'email', msg: 'email has already been registered' } })
      return res.status(400).json({ error })
    }
  },
  
  async destroy(req, res){
    const { id } = req.params 
    const userId = req.userId

    try {
      //verify authorizathion of the user logged
      const [authorized] = await connection('users').select('id').where({ id: userId })

      if(!authorized)
        return res.status(401).json({ value: nickname, param: 'nickname', msg: ' user is not authorized for this action'})
      
      await connection('users')
        .where({ id })
        .del()

      return res.status(204).send()
    } catch (error) {
      return res.status(400).json({ error })
    }
  },
}