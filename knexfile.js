module.exports = {
    development: {
      client: 'pg',
      connection: {
        host : '127.0.0.1',
        user : 'root',
        password : 'rootpasswd',
        database : 'sh-app',
        charset: 'utf8'
      },
      migrations: {
        directory: __dirname + '/src/database/migrations',
      },
      seeds: {
        directory: __dirname + '/src/database/seeds'
      }
    }
  }