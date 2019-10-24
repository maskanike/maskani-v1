const jwt = require('jsonwebtoken');


async function generateToken(user) {
  const data =  {
    id: user.id,
    name: user.name,
    email: user.email
  };
  const signature = 'muNduMweru'; // TODO should this be an env variable?
  const expiration = '6h';

  return await jwt.sign({ data }, signature, { expiresIn:expiration });
}

export default generateToken;