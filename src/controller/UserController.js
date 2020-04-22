const connection = require('../database/connection')

module.exports = {
  async index (req, res) {
    users = await connection('users').select('*').orderBy('created_at')

    return res.json( users )
  },

  async show(req, res){
    const { id } = req.params

    let user = await connection('users').select('*').where({ id })

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
    const {name, cpf, email, phone} = req.body
    const user = await connection('users')
      .insert({ name, cpf, email, phone })
      .returning('*')
      .catch(function(error) { 
        return res.json({ error, message: 'error when registering the user'}) 
      })
    
    return res.json( user )
  },

  async update(req, res){
    const { id } = req.params
    const {name, cpf, email, phone} = req.body
    const user = await connection('users')
      .where({ id })
      .update({ name, cpf, email, phone }, [ 'name', 'cpf', 'email', 'phone' ])
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