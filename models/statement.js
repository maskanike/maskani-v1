const statement = (sequelize, DataTypes) => {
  const Statement = sequelize.define('statement', {
    id:      { type:DataTypes.INTEGER, primaryKey:true, autoIncrement:true },
    amount:  { type:DataTypes.INTEGER, },
    type:    { type:DataTypes.ENUM, values:['payment', 'invoice', 'missed_credit', 'missed_debit'], },
    balance: { type:DataTypes.INTEGER, default:0 },
  });

  Statement.associate = models => {
    Statement.belongsTo(models.Tenant);
  };

  return Statement;
};

export default statement;