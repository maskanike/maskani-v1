const tenant = (sequelize, DataTypes) => {
  const Tenant = sequelize.define('tenant', {
    id:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rent:    { type: DataTypes.INTEGER, },
    deposit: { type: DataTypes.INTEGER, },
    balance: { type: DataTypes.INTEGER, },
  });

  Tenant.associate = models => {
    Tenant.hasOne(models.User);
    Tenant.hasOne(models.Statement);
    Tenant.hasOne(models.Unit);
    Tenant.hasMany(models.Receipt)
    Tenant.hasMany(models.Invoice)
  };

  return Tenant;
};

export default tenant;