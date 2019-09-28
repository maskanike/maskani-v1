const ejwt = require('express-jwt');

const getTokenFromHeader = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }
}

export default ejwt({
  secret: 'muNduMweru', // TODO store this an env variable.
  userProperty: 'token',
  getToken: getTokenFromHeader,
})