import * as argon2 from 'argon2';
import models from '../../models';
import generateJWT from './generate_token';
import validateKenyanPhoneNumber from '../utils/validate';

async function SignUp(email, name, msisdn, password) {
  const existingRecord = await models.User.findOne({ where: { email } });
  if (existingRecord) {
    return { error: 'email already registered' };
  }

  const validatedMsisdn = await validateKenyanPhoneNumber(msisdn);
  if (!validatedMsisdn) {
    return { error: 'Phone number invalid. Kindly check again' };
  }

  const passwordHashed = await argon2.hash(password);

  const userRecord = await models.User.create({
    password: passwordHashed,
    status: 'active',
    email,
    msisdn: validatedMsisdn,
    name,
  });

  return {
    user: {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
    },
    token: await generateJWT(userRecord),
  };
}

export default SignUp;
