// Adapted from https://github.com/santiq/nodejs-auth/

import models from '../models';

export default async (req, res, next) => {
  const decodedTokenData = req.token.data;
  const user = await models.User.findOne({ where: { id: decodedTokenData.id } });
  if (!user) {
    return res.status(401).end('User not found');
  }

  req.currentUser = user;
  return next();
};
