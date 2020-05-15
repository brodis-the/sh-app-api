const {v4: uuidv4} = require('uuid')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {
          id: uuidv4(),
          name: 'Joao', 
          nickname: 'Joao',
          cpf: '000.000.000-00', 
          email: 'joao@email.com', 
          password: '123456', 
          phone: '00 0000-0000'
        },
        {
          id: uuidv4(),
          name: 'Valeria', 
          nickname: 'valeria',
          cpf: '111.111.111-11', 
          email: 'valeria@email.com', 
          password: '123456', 
          phone: '11 1111-1111'
        },
        {
          id: uuidv4(),
          name: 'Maria', 
          nickname: 'maria',
          cpf: '222.222.222-22', 
          email: 'maria@email.com', 
          password: '123456', 
          phone: '22 2222-2222'
        },
      ]);
    });
};
