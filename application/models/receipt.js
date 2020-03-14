module.exports = (sequelize, DataTypes) => {
  const Receipt = sequelize.define('Receipt', {
    amount: DataTypes.INTEGER
  }, {});
  Receipt.associate = function(models) {
    Receipt.belongsTo(models.Tenant);
    Receipt.belongsTo(models.Unit);
  };
  return Receipt;
};