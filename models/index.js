
require('dotenv').config();
import Sequelize from 'sequelize';

const databaseUrl = process.env.DATABASE_URL || '' // TODO add a default localhost database URL for test env.
const sequelize = new Sequelize(databaseUrl);

const models = {
  User:         sequelize.import('./user'),
  Flat:         sequelize.import('./flat'),
  Unit:         sequelize.import('./unit'),
  Tenant:       sequelize.import('./tenant'),
  Invoice:      sequelize.import('./invoice'),
  Receipt:      sequelize.import('./receipt'),
  Statement:    sequelize.import('./statement'),
  Notification: sequelize.import('./notification'),
};

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

// Initialize the database
const createLandlordWithFlat = async () => {
  await models.User.create(
    {
      email:    'samuel@flatspad.com',
      msisdn:   '254723453841',
      password: '12345678',
      name:     'Samuel Magondu',
      status:   'active',
      role:     'landlord',
      flat: [
        {
          name:           'awesome flat',
          paymentDetails: '00001000010000',
          units: [
            {
              name:   'Unit 1',
              status: 'active',
            },
            {
              name:   'Unit 2',
              status: 'active',
            }
          ]
        },
      ],
    },
    {
      include: [
        {
          model: models.Flat,
          include: [models.Unit],
        }
      ],
    },
  );
};

const createTenantWithUnit = async (unitId) => {
  const tenant = await models.Tenant.create(
    {
      rent: 20000,
      deposit: 25000,
      balance: 0,
      user: [
        {
          email:    'magondunjenga@gmail.com',
          msisdn:   '254713849874',
          password: '12345678',
          name:     'Magondu Njenga',
          status:   'active',
          role:     'tenant'
        }
      ],
    },
    {
      include: [ models.User ],
    },
  );
  tenant.setUnit(1);
  tenant.setFlat(1);
};

export { sequelize, createLandlordWithFlat, createTenantWithUnit };

export default models;