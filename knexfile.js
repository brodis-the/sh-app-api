module.exports = {
    development: {
      client: 'pg',
      connection: {
        host : '127.0.0.1',
        user : 'postgres',
        password : 'Andressa!22',
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
