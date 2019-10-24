const receipt = (sequelize, DataTypes) => {
  const Receipt = sequelize.define('receipt', {
    id:      { type:DataTypes.INTEGER, primaryKey:true, autoIncrement:true },
    amount:  { type:DataTypes.INTEGER, },
  });

  Receipt.associate = models => {
    Receipt.belongsTo(models.Tenant);
  };


  return Receipt;
};

export default receipt;