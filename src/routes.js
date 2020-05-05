const express = require('express')

const UserController = require('./controller/UserController')
const BusinessController = require('./controller/BusinessController')
const AuthController = require('./controller/AuthController')

const UserMiddleware = require('./middlewares/UserMiddleware')
const BusinessMiddleware = require('./middlewares/BusinessMiddleware')

const Route = express.Router()

Route.get('/', (request, response) => {
  return response.json({
      descrição: 'Hello World',
      status: 'OK!'
  });
});

Route.post('/login', AuthController.login)
Route.post('/logout',AuthController.logout)

Route.get('/users', UserController.index )
Route.get('/users/:id', UserMiddleware.show, UserController.show )
Route.post('/users', UserMiddleware.store, UserController.store )
Route.patch('/users/:id', UserMiddleware.update, UserController.update )
Route.delete('/users/:id', UserMiddleware.destroy, UserController.destroy )

Route.get('/business', BusinessController.index )
Route.get('/business/:id', BusinessMiddleware.show, BusinessController.show )
Route.post('/business', BusinessMiddleware.store, BusinessController.store )
Route.patch('/business/:id', BusinessMiddleware.update, BusinessController.update )
Route.delete('/business/:id', BusinessMiddleware.destroy, BusinessController.destroy )

module.exports = Route;