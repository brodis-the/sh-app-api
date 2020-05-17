const {v4: uuidv4} = require('uuid')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('business').del()
    .then(function () {
      // Inserts seed entries
      return knex('business').insert([
        {
          id: uuidv4(),
          businessTitle: 'Carpintaria de José', 
          description: 'this is a business example', 
          phone: '00 0000-0000', 
          street: 'São Joao Paulo II', 
          neighborhood: 'Shalom da Paz', 
          zipCode: '65636330',
          coordinates: null, 
          userId: '77b37574-cc54-433a-8d65-009e74778b65'
        },
        {
          id: uuidv4(),
          businessTitle: 'Salão de Beleza das Marias', 
          description: 'this is a business example', 
          phone: '11 1111-1111', 
          street: 'Manoel Nogueira Lima, 144', 
          neighborhood: 'Joquei', 
          zipCode: '65636330',
          coordinates: `5°04'37.5"S 42°47'16.9"W`, 
          userId: '77b37574-cc54-433a-8d65-009e74778b65'
        },
        {
          id: uuidv4(),
          businessTitle: 'Lanchonete da Paz', 
          description: null, 
          phone: '22 2222-2222', 
          street: null, 
          neighborhood: null, 
          zipCode: null,
          coordinates: null, 
          userId: '77b37574-cc54-433a-8d65-009e74778b65'
        },
        {
          id: uuidv4(),
          businessTitle: 'Casa do TI', 
          description: 'Local onde é escrito muito código', 
          phone: '33 3333-3333', 
          street: 'VsCode, 256', 
          neighborhood: 'CPU', 
          zipCode: '01024-128',
          coordinates: `-5.034679, -42.839689`, 
          userId: '3dd2f58d-4c19-4f86-8f1a-f23dc2a30d64'
        },
      ]);
    });
};
