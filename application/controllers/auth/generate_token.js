const jwt = require('jsonwebtoken');

async function generateToken(user) {
  const data =  {
    id: user.id,
    name: user.name,
    email: user.email
  };
  const signature = process.env.AUTH_TOKEN;
  const expiration = '6h';

  return await jwt.sign({ data }, signature, { expiresIn:expiration });
}

export default generateToken;