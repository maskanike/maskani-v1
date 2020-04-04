module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    rent: DataTypes.INTEGER,
    water: DataTypes.INTEGER,
    garbage: DataTypes.INTEGER,
    penalty: DataTypes.INTEGER,
  }, {});
  Invoice.associate = (models) => {
    Invoice.belongsTo(models.Tenant);
    Invoice.belongsTo(models.Unit);
  };
  return Invoice;
};
