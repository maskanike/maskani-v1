module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      msisdn: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('active', 'pending', 'deleted')
      },
      role: {
        type: Sequelize.ENUM('landlord', 'agent', 'tenant')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('Users');
  }
};