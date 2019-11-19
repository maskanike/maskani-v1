module.exports = (sequelize, DataTypes) => {
  const Unit = sequelize.define('Unit', {
    name: DataTypes.STRING,
    status: DataTypes.ENUM('active', 'pending', 'deleted')
  }, {});
  Unit.associate = function(models) {
    Unit.belongsTo(models.Flat);
    Unit.belongsTo(models.Tenant);
  };
  return Unit;
};