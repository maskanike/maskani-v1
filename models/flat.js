const flat = (sequelize, DataTypes) => {
  const Flat = sequelize.define('flat', {
    id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:           { type: DataTypes.STRING, },
    paymentDetails: { type: DataTypes.STRING, },
    // TODO Create a JSON object to store landlord ID and agent ID as well as other managers.

  });

  Flat.associate = models => {
    Flat.belongsTo(models.User);
  };

  Flat.associate = models => {
    Flat.hasMany(models.Unit, { onDelete: 'CASCADE' });
  };
  return Flat;
};

export default flat;