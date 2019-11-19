module.exports = (sequelize, DataTypes) => {
  const Statement = sequelize.define('Statement', {
    amount: DataTypes.INTEGER,
    balance: DataTypes.INTEGER,
    type: DataTypes.ENUM('payment', 'invoice', 'missed_credit', 'missed_debit')
  }, {});
  Statement.associate = function(models) {
    Statement.belongsTo(models.Tenant);
  };
  return Statement;
};