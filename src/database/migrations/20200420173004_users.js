
exports.up = function(knex) {
  return knex.schema 
  .createTable( 'users', (table) => {
    table.increments('id')
    table.string('name').notNullable()
    table.string('cpf').notNullable()
    table.string('email').notNullable()
    table.string('phone').notNullable()
    table.timestamps()
  })
};

exports.down = function(knex) {
  return knex.schema
  .dropTable('users')
};
