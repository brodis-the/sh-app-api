const connection = require('../database/connection')

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
    const {businessTitle, description, phone, street, neighborhood, coordinates,userId} = req.body
    let error

    const business = await connection('business')
      .insert({ businessTitle, description, phone, street, neighborhood, coordinates,userId })
      .returning('*')
      .catch((err) =>{ 
        error = err
      })
    
    return res.json( business || { error })
  },

  async update(req, res){
    const { id } = req.params
    const {businessTitle, description, phone, street, neighborhood, coordinates,userId} = req.body
    let error

    const business = await connection('business')
      .where({ id })
      .update(
        {businessTitle, description, phone, street, neighborhood, coordinates,userId},
        ['businessTitle', 'description', 'phone', 'street', 'neighborhood', 'coordinates','userId', 'updated_at']
        )
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