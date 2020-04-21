const express = require('express')

const UserController = require('./controller/UserController')
const BusinessController = require('./controller/BusinessController')

const Route = express.Router()

Route.get('/', (request, response) => {
  return response.json({
      descrição: 'Hello World',
      status: 'OK!'
  });
});
Route.get('/users', UserController.index )
Route.get('/business', BusinessController.index )

module.exports = Route;