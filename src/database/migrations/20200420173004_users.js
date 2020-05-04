
exports.up = function(knex) {
  return knex.schema 
  .createTable( 'users', (table) => {
    table.increments('id')
    table.string('name').notNullable()
    table.string('cpf', 14)
    table.string('email').notNullable()
    table.string('password').notNullable()
    table.string('phone', 17)
    table.timestamps(true, true)
  })
  .alterTable('users', (table)=>{
    table.unique('email')
  })
};

exports.down = function(knex) {
  return knex.schema
  .dropTable('users')
};
