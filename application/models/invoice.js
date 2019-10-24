const invoice = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('invoice', {
    id:      { type:DataTypes.INTEGER, primaryKey:true, autoIncrement:true },
    rent:    { type:DataTypes.INTEGER, },
    water:   { type:DataTypes.INTEGER, default:0 },
    garbage: { type:DataTypes.INTEGER, default:0 },
    penalty: { type:DataTypes.INTEGER, default:0 },
  });

  Invoice.associate = models => {
    Invoice.belongsTo(models.Tenant);
  };


  return Invoice;
};

export default invoice;