import * as argon2 from 'argon2';
import models from '../../models';
import generateJWT from './generate_token';

async function SignUp(email, name, msisdn, password1, password2) {
  if (password1 !== password2) {
    return "passwords do not match";
  }

  const existingRecord = await models.User.findOne({ where: { email }});
  if (existingRecord) {
    return "email already registered"
  }

  // TODO validate phone number is valid.

  const passwordHashed = await argon2.hash(password1);

  const userRecord = await models.User.create({
    password: passwordHashed,
    status: 'active',
    email,
    msisdn,
    name,
  });

  return {
    user: {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
    },
    token: await generateJWT(userRecord),
  }
}

export default SignUp;