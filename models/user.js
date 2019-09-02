const user = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    id:       { type:DataTypes.INTEGER, primaryKey:true, autoIncrement:true },
    email:    { type:DataTypes.STRING, unique:true, },
    msisdn: { type:DataTypes.STRING, unique:true, },
    password: { type:DataTypes.STRING, },
    name:     { type:DataTypes.STRING, },
    status:   { type:DataTypes.ENUM, values:['active', 'pending', 'deleted'] },
    role:     { type:DataTypes.ENUM, values:['landlord', 'agent', 'tenant'] },
  });
  User.associate = models => {
    User.hasOne(models.Flat);
  };

  User.findByLogin = async login => {
    let user = await User.findOne({
      where: { email: login },
    });

    if (!user) {
      user = await User.findOne({
        where: { email: login },
      });
    }

    return user;
  };

  return User;
};

export default user;