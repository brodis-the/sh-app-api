
exports.up = function(knex) {
  return knex.schema
    .createTable('_tokens', (table)=>{
      table.increments('id')
      table.string('token', 255).notNullable()
      table.string('type', 80).notNullable()
      table.boolean('isRevoked').defaultTo(false)
      table.integer('userId').unsigned().notNullable()
      table.foreign('userId').references('id').inTable('users')
        .onDelete('CASCADE').onUpdate('CASCADE')
      table.timestamps(true, true)
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('_tokens')
};
