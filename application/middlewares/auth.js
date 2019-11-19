const ejwt = require('express-jwt');

const getTokenFromHeader = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }
}

export default ejwt({
  secret: process.env.AUTH_TOKEN,
  userProperty: 'token',
  getToken: getTokenFromHeader,
})