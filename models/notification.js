const notification = (sequelize, DataTypes) => {
  const Notification = sequelize.define('notification', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    message:     { type: DataTypes.STRING, },
    desitnation: { type: DataTypes.STRING, },
    type:        { type: DataTypes.ENUM, values: ['email', 'sms'] },
    error:       { type: DataTypes.JSON, },
    status:      { type: DataTypes.ENUM, values: ['success', 'failed'] },
  });

  Notification.associate = models => {
    Notification.belongsTo(models.Tenant);
  };


  return Notification;
};

export default notification;