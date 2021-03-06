
exports.up = function(knex) {
  return knex.schema
    .createTable('business', (table) => {
      table.uuid('id').primary()
      table.string('businessTitle').notNullable()
      table.string('description', 500)
      table.string('phone', 17).notNullable()
      table.string('street')
      table.string('neighborhood')
      table.string('zipCode', 9)
      table.string('coordinates')
      table.uuid('userId').unsigned().notNullable()
      table.foreign('userId').references('id').inTable('users')
        .onDelete('CASCADE').onUpdate('CASCADE')
        table.timestamp('createdAt', { precision: 6 }).defaultTo(knex.fn.now(6))
        table.timestamp('updatedAt', { precision: 6 }).defaultTo(knex.fn.now(6))
    })
};

exports.down = function(knex) {
  return knex.schema
  .dropTable('business')
};
