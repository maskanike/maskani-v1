'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Invoices',
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
      'Invoices',
      'UnitId',
    )
  }
};
