const tenant = (sequelize, DataTypes) => {
  const Tenant = sequelize.define('tenant', {
    id:      { type:DataTypes.INTEGER, primaryKey:true, autoIncrement:true },
    rent:    { type:DataTypes.INTEGER, },
    deposit: { type:DataTypes.INTEGER, },
    balance: { type:DataTypes.INTEGER, default:0 },
    water:   { type:DataTypes.INTEGER, default:0 },
    garbage: { type:DataTypes.INTEGER, default:0 },
    penalty: { type:DataTypes.INTEGER, default:0 },
    status:  { type:DataTypes.ENUM, values:['unchanged', 'changed', 'left'] },
  });

  Tenant.associate = models => {
    Tenant.hasOne(models.Statement);
    Tenant.hasOne(models.Unit);
    Tenant.hasMany(models.Receipt)
    Tenant.hasMany(models.Invoice)
    Tenant.belongsTo(models.Flat)
    Tenant.belongsTo(models.User);
  };

  return Tenant;
};

export default tenant;