module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('Invoices', [{
    rent: 100,
    water: 0,
    garbage:0,
    penalty:0,
    TenantId:3,
    createdAt: new Date(),
    updatedAt: new Date(),
  }], {});
  },

  down: (queryInterface) => {
      return queryInterface.bulkDelete('Invoices', null, {});
  }
};
