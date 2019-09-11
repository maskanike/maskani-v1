const unit = (sequelize, DataTypes) => {
  const Unit = sequelize.define('unit', {
    id:       { type:DataTypes.INTEGER, primaryKey:true, autoIncrement:true },
    name:     { type:DataTypes.STRING, },
    status:   { type:DataTypes.ENUM, values:['active', 'pending', 'deleted'] },
  });

  Unit.associate = models => {
    Unit.belongsTo(models.Flat);
    Unit.belongsTo(models.Tenant);
  };

  return Unit;
};

export default unit;