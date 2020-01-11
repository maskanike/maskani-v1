'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Receipts',
      'UnitId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Units',
          key: 'id',
        },
      })
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn(
      'Receipts',
      'UnitId',
    )
  }
};
