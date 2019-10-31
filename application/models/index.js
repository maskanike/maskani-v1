
require('dotenv').config();
 
import Sequelize from 'sequelize';
import * as argon2 from 'argon2';

const databaseUrl = process.env.DATABASE_URL || '' // TODO add a default localhost database URL for test env.
const sequelize = new Sequelize(databaseUrl, {
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    throw new Error('Unable to connect to the database:', err);
  });


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
  const passwordHashed = await argon2.hash('12345678');

  await models.User.create(
    {
      email:    'samuel@flatspad.com',
      msisdn:   '254723453841',
      password:  passwordHashed,
      name:     'Samuel Magondu',
      status:   'active',
      role:     'landlord',
      flat: [
        {
          name:           'Watercress Woods',
          paymentDetails: '00001000010000',
          units: [
            {
              name:   '3E/07',
              status: 'active',
            },
            {
              name:   '3E/01',
              status: 'active',
            },
            {
              name:   '3E/02',
              status: 'active',
            },
            {
              name:   '3E/03',
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

const createTenantMagonduWithUnit = async () => {
  const passwordHashed = await argon2.hash('12345678');

  const tenant = await models.Tenant.create(
    {
      rent:    20000,
      deposit: 25000,
      balance: 0,
      garbage: 400 ,
      water:   700,
      penalty: 100,
      user: [
        {
          email:    'magondunjenga@gmail.com',
          msisdn:   '254713849874',
          password: passwordHashed,
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

const createTenantEugeneWithUnit = async () => {
  const passwordHashed = await argon2.hash('12345678');
  const tenant = await models.Tenant.create(
    {
      rent:    10000,
      deposit: 15000,
      balance: 0,
      garbage: 340,
      water:   500,
      penalty: 0,
      user: [
        {
          email:    'eugenenyawara@gmail.com',
          msisdn:   '254725902510',
          password:  passwordHashed,
          name:     'Eugene Nyawara',
          status:   'active',
          role:     'tenant'
        }
      ],
    },
    {
      include: [ models.User ],
    },
  );
  tenant.setUnit(2);
  tenant.setFlat(1);

  // TODO remove this after testing
  const tenant2 = await models.Tenant.create(
    {
      rent:    12000,
      deposit: 17000,
      balance: 0,
      garbage: 690,
      water:   600,
      penalty: 10,
      user: [
        {
          email:    'magonduback@gmail.com',
          msisdn:   '254723453841',
          password:  passwordHashed,
          name:     'Magondu Back',
          status:   'active',
          role:     'tenant'
        }
      ],
    },
    {
      include: [ models.User ],
    },
  );
  tenant2.setFlat(1);

};

export { sequelize, createLandlordWithFlat, createTenantEugeneWithUnit, createTenantMagonduWithUnit };

export default models;