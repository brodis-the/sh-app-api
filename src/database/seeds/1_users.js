
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {
          name: 'Joao', 
          cpf: '000.000.000-00', 
          email: 'joao@email.com', 
          phone: '00 0000-0000'
        },
        {
          name: 'Valeria', 
          cpf: '111.111.111-11', 
          email: 'valeria@email.com', 
          phone: '11 1111-1111'
        },
        {
          name: 'Maria', 
          cpf: '222.222.222-22', 
          email: 'maria@email.com', 
          phone: '22 2222-2222'
        },
      ]);
    });
};
