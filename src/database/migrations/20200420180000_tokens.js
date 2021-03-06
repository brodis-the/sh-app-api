
exports.up = function(knex) {
  return knex.schema
    .createTable('_tokens', (table)=>{
      table.uuid('id').primary()
      table.string('token', 255).notNullable()
      table.string('type', 80).notNullable()
      table.boolean('isRevoked').defaultTo(false)
      table.uuid('userId').unsigned().notNullable()
      table.foreign('userId').references('id').inTable('users')
        .onDelete('CASCADE').onUpdate('CASCADE')
        table.timestamp('createdAt', { precision: 6 }).defaultTo(knex.fn.now(6))
        table.timestamp('updatedAt', { precision: 6 }).defaultTo(knex.fn.now(6))
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('_tokens')
};
