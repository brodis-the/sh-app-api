
exports.up = function(knex) {
  return knex.schema
  .createTable('business', (table) => {
    table.increments('id')
    table.string('businessTitle').notNullable()
    table.string('description', 500)
    table.string('phone', 17).notNullable()
    table.string('street')
    table.string('neighborhood')
    table.string('zipCode', 9)
    table.string('coordinates')
    table.integer('userId').unsigned().notNullable()
    table.foreign('userId').references('id').inTable('users')
      .onDelete('CASCADE').onUpdate('CASCADE')
    table.timestamps(true, true)
  })
};

exports.down = function(knex) {
  return knex.schema
  .dropTable('business')
};
