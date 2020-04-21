const connection = require('../database/connection')

module.exports = {
  async index (req, res) {
    business = await connection('business').select('*')

    return res.json( business )
  }
}