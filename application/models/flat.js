module.exports = (sequelize, DataTypes) => {
  const Flat = sequelize.define('Flat', {
    name: DataTypes.STRING,
    paymentDetails: DataTypes.STRING
  }, {});
  Flat.associate = function(models) {
    Flat.belongsTo(models.User);
  };
  return Flat;
};