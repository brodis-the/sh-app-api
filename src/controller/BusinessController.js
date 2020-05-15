const connection = require('../database/connection')
const { v4: uuidv4 } = require('uuid')
const cepPromise = require('cep-promise')

module.exports = {
  async index (req, res) {
    business = await connection('business').select('*').orderBy('createdAt')

    return res.json( business )
  },

  async show(req, res){
    const { id } = req.params

    try {
      const [business] = await connection('business')
        .join('users', 'users.id', '=', 'business.userId')
        .select(['business.*', { userName: 'users.name', userEmail: 'users.email'}])
        .where( 'business.id', id)
  
      if (!business) 
        return res.status(404).json({ error: { value: id, param: 'busines.id', msg: 'Business not found'}})
  
      return res.json( business )
    } catch (error) {
      return res.status(400).json({ error })
    }
  },

  async store(req, res){
    const {businessTitle, description, phone, street, neighborhood, zipCode, coordinates} = req.body
    const userId = req.userId

    try {
      const [user] = await connection('users').select('id').where({ id: userId})
      if(!user) 
        return res.status(400).json({ error: { value: userId, param: 'userId', msg: 'user not exists' }})

      if(zipCode){
        if(typeof(zipCode) == 'string'){
          await cepPromise(zipCode.normalize('NFD').replace(/[^0-9]/g, ''))
        }else{
          await cepPromise(zipCode)
        }
      }
  
      const business = await connection('business')
        .insert({ id: uuidv4(), businessTitle, description, phone, street, neighborhood, zipCode, coordinates,userId })
        .returning('*')
      
      return res.json( business )
    } catch (error) {
      if (error.name === "CepPromiseError")
        return res.status(400).json({ error: { value: zipCode, param: 'zipCode', msg: error.errors[0].message } })
      return res.status(400).json({ error })
    }
  },

  async update(req, res){
    const {businessTitle, description, phone, street, neighborhood, zipCode, coordinates} = req.body
    const { id } = req.params
    const userId = req.userId

    try {
      // verify if user is owner of the business
      const [owner] = await connection('business')
        .select('id', 'userId')
        .where({ id, userId})
      
      if(!owner)
        return res.status(401).json({ error: { value: id, param: 'business.id',msg: 'user is not authorized for this action'}})
      
      if(zipCode){
        if(typeof(zipCode) == 'string'){
          await cepPromise(zipCode.normalize('NFD').replace(/[^0-9]/g, ''))
        }else{
          await cepPromise(zipCode)
        }
      }
  
      const [business] = await connection('business')
        .where({ id })
        .update({businessTitle, description, phone, street, neighborhood, zipCode, coordinates})
        .then(async () => {
          const updateTimestamps = await connection('business')
          .where({ id })
          .update({ updatedAt: connection.fn.now(6) },
            ['businessTitle', 'description', 'phone', 'street', 'neighborhood', 'zipCode', 'coordinates', 'updatedAt'])
          return updateTimestamps
        })
      
      if (!business) 
        return res.status(404).json({ error: { value: id, param: 'busines.id', msg: 'Business not found'}})
      
      return res.json( business )
    } catch (error) {
      return res.status(400).json({ error })
    }
  },

  async destroy(req, res){
    const { id } = req.params 
    const userId = req.userId

    try {
      // verify if user is owner of the business
      const [owner] = await connection('business')
        .select('id', 'userId')
        .where({ id, userId})
      
      if(!owner)
        return res.status(401).json({ error: { value: id, param: 'business.id',msg: 'user is not authorized for this action'}})
  
      await connection('business')
        .where({ id })
        .del()
      
      return res.status(204).send()
    } catch (error) {
      return res.status(400).json({ error })
    }
  },
}