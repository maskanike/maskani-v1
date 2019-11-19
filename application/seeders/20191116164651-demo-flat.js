module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('Flats', [{
      id:1,
      name: 'Watercress Woods',
      paymentDetails: '00001000010000',
      UserId:1,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('Flats', null, {});
  }
};
