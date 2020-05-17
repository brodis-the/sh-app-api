const crypto = require('crypto')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {
          id: '77b37574-cc54-433a-8d65-009e74778b65',
          name: 'Joao', 
          nickname: 'Joao',
          cpf: '000.000.000-00', 
          email: 'joao@email.com', 
          emailVerifiedAt: '2020-05-17T01:06:22.319Z',
          password: crypto.createHash('sha256').update('123456').digest('base64'), 
          phone: '00 0000-0000'
        },
        {
          id: '3dd2f58d-4c19-4f86-8f1a-f23dc2a30d64',
          name: 'Valeria', 
          nickname: 'valeria',
          cpf: '111.111.111-11', 
          email: 'valeria@email.com', 
          emailVerifiedAt: '2020-05-20T01:06:22.323Z',
          password: crypto.createHash('sha256').update('123456').digest('base64'),  
          phone: '11 1111-1111'
        },
        {
          id: '31328235-aad0-463a-a9c8-05d09c7db6ec',
          name: 'Maria', 
          nickname: 'maria',
          cpf: '222.222.222-22', 
          email: 'maria@email.com', 
          emailVerifiedAt: null,
          password: crypto.createHash('sha256').update('123456').digest('base64'), 
          phone: '22 2222-2222'
        },
      ]);
    });
};
