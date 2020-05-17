
exports.up = function(knex) {
  return knex.schema 
    .createTable( 'users', (table) => {
      table.uuid('id').primary()
      table.string('name').notNullable()
      table.string('nickname').notNullable()
      table.string('cpf', 14)
      table.string('email').notNullable()
      table.string('password').notNullable()
      table.string('phone', 17)
      table.timestamp('emailVerifiedAt', { precision: 6 })
      table.timestamp('createdAt', { precision: 6 }).defaultTo(knex.fn.now(6))
      table.timestamp('updatedAt', { precision: 6 }).defaultTo(knex.fn.now(6))
    })
    .alterTable('users', (table)=>{
      table.unique('email')
      table.unique('nickname')
    })
};

exports.down = function(knex) {
  return knex.schema
  .dropTable('users')
};
