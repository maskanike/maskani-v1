module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    msisdn: DataTypes.STRING,
    password: DataTypes.STRING,
    status: DataTypes.ENUM('active', 'pending', 'deleted'),
    role: DataTypes.ENUM('landlord', 'agent', 'tenant'),
  }, {});
  return User;
};
