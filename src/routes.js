const express = require('express')

const UserController = require('./controller/UserController')
const BusinessController = require('./controller/BusinessController')

const UserMiddleware = require('./middlewares/UserMiddleware')
const BusinessMiddleware = require('./middlewares/BusinessMiddleware')

const Route = express.Router()

Route.get('/', (request, response) => {
  return response.json({
      descrição: 'Hello World',
      status: 'OK!'
  });
});

Route.get('/users', UserController.index )
Route.get('/users/:id', UserMiddleware.show, UserController.show )
Route.post('/users', UserMiddleware.store, UserController.store )
Route.patch('/users/:id', UserMiddleware.update, UserController.update )
Route.delete('/users/:id', UserMiddleware.destroy, UserController.destroy )

Route.get('/business', BusinessController.index )
Route.get('/business/:id', BusinessController.show )
Route.post('/business', BusinessController.store )
Route.patch('/business/:id', BusinessController.update )
Route.delete('/business/:id', BusinessController.destroy )

module.exports = Route;