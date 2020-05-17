const express = require('express')

const UserController = require('./controller/UserController')
const BusinessController = require('./controller/BusinessController')
const AuthController = require('./controller/AuthController')

const UserMiddleware = require('./middlewares/UserMiddleware')
const BusinessMiddleware = require('./middlewares/BusinessMiddleware')
const AuthMiddleware = require('./middlewares/AuthMiddleware')
const auth = AuthMiddleware.auth

const Route = express.Router()

Route.get('/', (request, response) => {
  return response.json({
      descrição: 'Hello World',
      status: 'OK!'
  });
});

Route.post('/login', AuthMiddleware.login, AuthController.login)
Route.patch('/logout', AuthMiddleware.logout, AuthController.logout)
Route.post('/password/forgot', AuthMiddleware.forgot, AuthController.forgotPassword)
Route.patch('/password/reset', AuthMiddleware.resetPassword, AuthController.resetPassword)
Route.patch('/password/reset/abort', AuthMiddleware.checkToken, AuthController.abortResetPassword)
Route.patch('/email/verify', AuthMiddleware.checkToken, AuthController.verifyEmail)
Route.patch('/email/verify/abort', AuthMiddleware.checkToken, AuthController.abortVerifyEmail)

Route.get('/users', auth, UserController.index )
Route.get('/users/:nickname', auth, UserMiddleware.show, UserController.show )
Route.post('/users', UserMiddleware.store, UserController.store )
Route.patch('/users/:nickname', auth, UserMiddleware.update, UserController.update )
Route.delete('/users/:id', auth, UserMiddleware.destroy, UserController.destroy )

Route.get('/business', auth, BusinessController.index )
Route.get('/business/:id', auth, BusinessMiddleware.show, BusinessController.show )
Route.post('/business', auth, BusinessMiddleware.store, BusinessController.store )
Route.patch('/business/:id', auth, BusinessMiddleware.update, BusinessController.update )
Route.delete('/business/:id', auth, BusinessMiddleware.destroy, BusinessController.destroy )

module.exports = Route;