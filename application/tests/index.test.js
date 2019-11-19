import { sequelize, User } from '../models';
import generateToken from '../controllers/auth/generate_token';

require('dotenv').config();

const chai = require('chai');
const supertest = require('supertest');
const app = require('../app');
const argon2 = require('argon2');

global.app = app;
global.should = chai.should();
global.expect = chai.expect;
global.assert = chai.assert;
global.request = supertest(app);

before(async () => {
  await sequelize.authenticate().catch((err) => {
    throw new Error('Unable to connect to the database:', err);
  });
  
  const password = await argon2.hash('12345678');

  const user = await User.create({
    name: 'samuel', email: 'samuel@flatspad.com', msisdn: '0700000000', password,
  });

  const token = await generateToken(user)
  global.token = token;
});

after(() => {
  Object.values(sequelize.models).map((model) => model.destroy({ truncate: true }));
});
