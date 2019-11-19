module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    message: DataTypes.JSON,
    destination: DataTypes.STRING,
    type: DataTypes.ENUM('email', 'sms'),
    status: DataTypes.ENUM('success', 'failed'),
    error: DataTypes.JSON
  }, {});
  Notification.associate = function(models) {
    Notification.belongsTo(models.Tenant);
  };
  return Notification;
};