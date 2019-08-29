const invoice = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('invoice', {
    id:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rent:    { type: DataTypes.INTEGER, },
    water:   { type: DataTypes.INTEGER, },
    penalty: { type: DataTypes.INTEGER, },
  });

  Invoice.associate = models => {
    Invoice.belongsTo(models.Tenant);
  };


  return Invoice;
};

export default invoice;