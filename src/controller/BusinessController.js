const connection = require('../database/connection')
const { v4: uuidv4 } = require('uuid')
const cepPromise = require('cep-promise')

module.exports = {
  async index (req, res) {
    business = await connection('business').select('*').orderBy('created_at')

    return res.json( business )
  },

  async show(req, res){
    const { id } = req.params
    let error

    const business = await connection('business')
      .join('users', 'users.id', '=', 'business.userId')
      .select([
        'business.*',
        {
          userName: 'users.name',
          userEmail: 'users.email'
        }
      ])
      .where( 'business.id', id)
      .catch((err)=>{
        error = err
      })

    if (!business[0]) res.json({ error: { code: 404, message: 'Business not found'}})

    return res.json( business || {error} )
  },

  async store(req, res){
    const {businessTitle, description, phone, street, neighborhood, zipCode, coordinates, userId} = req.body

    try {
      const [user] = await connection('users').select('id').where({ id: userId})
      if(!user) 
        return res.status(400).json({ error: { value: userId, param: 'userId', msg: 'user not exists' }})

      if(zipCode && (typeof(zipCode) == 'string')){
        await cepPromise(zipCode.normalize('NFD').replace(/[^0-9]/g, ''))
      }else if (zipCode && (typeof(zipCode) == 'number') ){
        await cepPromise(zipCode)
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
    const { id } = req.params
    const {businessTitle, description, phone, street, neighborhood, zipCode, coordinates} = req.body
    let error

    if(zipCode){
      try {
        if(typeof(zipCode) == 'string'){
          await cepPromise(zipCode.normalize('NFD').replace(/[^0-9]/g, ''))
        }else{
          await cepPromise(zipCode)
        }
      } catch (error) {
        return res.json({ error })
      }
    }

    const business = await connection('business')
      .where({ id })
      .update(
        {businessTitle, description, phone, street, neighborhood, zipCode, coordinates}
        )
      .then(async () => {
        const result = await connection('business')
        .where({ id })
        .update(
          { updated_at: connection.fn.now(6) },
          ['businessTitle', 'description', 'phone', 'street', 'neighborhood', 'zipCode', 'coordinates', 'updated_at']
        )
        return result
      })
      .catch((err) =>{ 
        error = err
      })
    
    if (!business[0]) res.json({ error: { code: 404, message: 'Business not found'}})
    
    return res.json( business || { error })
  },

  async destroy(req, res){
    const { id } = req.params 
    let error

    await connection('business')
      .where({ id })
      .del()
      .catch((err) =>{ 
        error = err
      })

    if( error ) res.json({ error })

    return res.status(204).send()
  },
}