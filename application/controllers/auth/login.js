import * as argon2 from 'argon2';
import models from '../../models';
import generateJWT from './generate_token';
import logError from '../utils/error_notify';

async function Login(email, password) {
  const userRecord = await models.User.findOne({ where: { email } });
  if (!userRecord) {
    logError(`Log in failed: user ${email} not found`);
    return { error: 'User not found' };
  }
  const correctPassword = await argon2.verify(userRecord.password, password);
  if (!correctPassword) {
    logError(`Log in failed: user ${email} password incorrect`);
    return { error: 'Incorrect password' };
  }

  return {
    user: {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
    },
    token: await generateJWT(userRecord),
  };
}

export default Login;
