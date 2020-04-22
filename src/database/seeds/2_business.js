
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('business').del()
    .then(function () {
      // Inserts seed entries
      return knex('business').insert([
        {
          businessTitle: 'Business Example', 
          description: 'this is a business example', 
          phone: '00 0000-0000', 
          street: null, 
          neighborhood: null, 
          coordinates: null, 
          userId: 1
        },
        {
          businessTitle: 'Business Example 2', 
          description: 'this is a business example', 
          phone: '00 0000-0000', 
          street: null, 
          neighborhood: null, 
          coordinates: null, 
          userId: 2
        },
      ]);
    });
};
