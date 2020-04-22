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
Route.get('/users/:id', UserController.show )
Route.post('/users', UserController.store )
Route.patch('/users/:id', UserController.update )
Route.delete('/users/:id', UserController.destroy )

Route.get('/business', BusinessController.index )

module.exports = Route;