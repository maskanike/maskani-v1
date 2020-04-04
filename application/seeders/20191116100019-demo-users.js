const argon2 = require('argon2');

module.exports = {
  up: async (queryInterface) => {
    const password = await argon2.hash('12345678');
    return queryInterface.bulkInsert('Users', [{
      id: 1,
      email: 'samuel@flatspad.com',
      msisdn: '254723453841',
      password,
      name: 'Samuel Magondu',
      status: 'active',
      role: 'landlord',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      email: 'magondunjenga@gmail.com',
      msisdn: '254713849874',
      password,
      name: 'Magondu Njenga',
      status: 'active',
      role: 'tenant',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      email: 'eugenenyawara@gmail.com',
      msisdn: '254725902510',
      password,
      name: 'Eugene Nyawara',
      status: 'active',
      role: 'tenant',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      email: 'magonduback@gmail.com',
      msisdn: '254723453841',
      password,
      name: 'Magondu Back',
      status: 'active',
      role: 'tenant',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    ]);
  },

  down: (queryInterface) => queryInterface.bulkDelete('Users', null, {}),
};
