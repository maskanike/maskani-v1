module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('Statements', [{
      amount: 100,
      balance: 0,
      type: 'invoice',
      TenantId:3,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('Statements', null, {});
  }
};
