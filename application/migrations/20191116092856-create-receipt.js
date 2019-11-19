'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Receipts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      amount: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      TenantId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Tenants',
          key: 'id',
        },
      },
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('Receipts');
  }
};