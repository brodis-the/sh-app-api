const connection = require('../database/connection')
const crypto = require('crypto')

module.exports = {
  async index (req, res) {
    users = await connection('users')
      .select('id', 'name', 'cpf', 'email', 'phone', 'created_at', 'updated_at')
      .orderBy('created_at')

    return res.json( users )
  },

  async show(req, res){
    const { id } = req.params

    let user = await connection('users')
      .select('id', 'name', 'cpf', 'email', 'phone', 'created_at', 'updated_at')
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
    const encryptedPassword = crypto.createHash('sha256').update(password).digest('base64')
    const user = await connection('users')
      .insert({ name, cpf, email, password: encryptedPassword, phone },
        [ 'id', 'name', 'cpf', 'email', 'phone', 'created_at', 'updated_at'])
      .catch(function(error) { 
        return res.status(400).json({ error, message: 'error when registering the user'}) 
      })
    
    return res.json( user )
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