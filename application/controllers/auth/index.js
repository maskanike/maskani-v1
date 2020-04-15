import { User, UserAccess } from '../../models';

const jwt = require('jsonwebtoken');
const { addHours } = require('date-fns');
const { matchedData } = require('express-validator');
const auth = require('../../middleware/auth');
const utils = require('../../middleware/utils');

const HOURS_TO_BLOCK = 2;
const LOGIN_ATTEMPTS = 5;

/** *******************
 * Private functions *
 ******************** */

/**
 * Generates a token
 * @param {Object} user - user object
 */
const generateToken = (user) => {
  // Gets expiration time
  const expiration = Math.floor(Date.now() / 1000) + 60 * process.env.JWT_EXPIRATION_IN_MINUTES;

  // returns signed and encrypted token
  return auth.encrypt(
    jwt.sign(
      {
        data: {
          id: user,
        },
        exp: expiration,
      },
      process.env.JWT_SECRET,
    ),
  );
};

/**
   * Creates an object with user info
   * @param {Object} req - request object
   */
const setUserInfo = (req) => {
  let user = {
    id: req.id,
    name: req.name,
    email: req.email,
    role: req.role,
    verified: req.verified,
  };
  // Adds verification for testing purposes
  if (process.env.NODE_ENV !== 'production') {
    user = {
      ...user,
      verification: req.verification,
    };
  }
  return user;
};

/**
 * Checks if blockExpires from user is greater than now
 * @param {Object} user - user object
 */
const userIsBlocked = async (user) => new Promise((resolve, reject) => {
  if (user.blockExpires > new Date()) {
    reject(utils.buildErrObject(409, 'BLOCKED_USER'));
  }
  resolve(true);
});

/**
 * Finds user by email
 * @param {string} email - user´s email
 */
const findUser = async (email) => new Promise((resolve, reject) => {
  User.findOne({
    where: { email },
    attributes: ['password', 'loginAttempts', 'blockExpires', 'name', 'email', 'role', 'verified', 'verification'],
  })
    .then((user) => user)
    .catch((err, item) => {
      utils.itemNotFound(err, item, reject, 'USER_DOES_NOT_EXIST');
      resolve(item);
    });
});

/**
 * Saves login attempts to dabatabse
 * @param {Object} user - user object
 */
const saveLoginAttemptsToDB = async (user) => new Promise((resolve, reject) => {
  user.save((err, result) => {
    if (err) {
      reject(utils.buildErrObject(422, err.message));
    }
    if (result) {
      resolve(true);
    }
  });
});

/**
   * Blocks a user by setting blockExpires to the specified date based on constant HOURS_TO_BLOCK
   * @param {Object} user - user object
   */
const blockUser = async (user) => new Promise((resolve, reject) => {
  user.blockExpires = addHours(new Date(), HOURS_TO_BLOCK); // eslint-disable-line no-param-reassign
  user.save((err, result) => {
    if (err) {
      reject(utils.buildErrObject(422, err.message));
    }
    if (result) {
      resolve(utils.buildErrObject(409, 'BLOCKED_USER'));
    }
  });
});

/**
 * Adds one attempt to loginAttempts, then compares loginAttempts with the constant LOGIN_ATTEMPTS,
 * if is less returns wrong password, else returns blockUser function
 * @param {Object} user - user object
 */
const passwordsDoNotMatch = async (user) => {
  user.loginAttempts += 1; // eslint-disable-line no-param-reassign
  await saveLoginAttemptsToDB(user);
  return new Promise((resolve, reject) => {
    if (user.loginAttempts <= LOGIN_ATTEMPTS) {
      resolve(utils.buildErrObject(409, 'WRONG_PASSWORD'));
    } else {
      resolve(blockUser(user));
    }
    reject(utils.buildErrObject(422, 'ERROR'));
  });
};

/**
 * Checks if mobile number is valid in that locale,
 * if correct, return mobile number, if not, throw error
 */
const mobileNumberNotValid = async () => new Promise((resolve) => {
  resolve(utils.buildErrObject(400, 'MSISDN_INVALID'));
});


/**
 * Saves a new user access and then returns token
 * @param {Object} req - request object
 * @param {Object} user - user object
 */
const saveUserAccessAndReturnToken = async (req, user) => new Promise((resolve, reject) => {
  const userAccess = new UserAccess({
    email: user.email,
    ip: utils.getIP(req),
    browser: utils.getBrowserInfo(req),
    country: utils.getCountry(req),
  });
  userAccess.save((err) => {
    if (err) {
      reject(utils.buildErrObject(422, err.message));
    }
    const userInfo = setUserInfo(user);
    // Returns data with access token
    resolve({
      token: generateToken(user.id),
      user: userInfo,
    });
  });
});

/**
 * Checks that login attempts are greater than specified in constant
 * and also that blockexpires is less than now
 * @param {Object} user - user object
 */
const blockIsExpired = (user) => user.loginAttempts > LOGIN_ATTEMPTS && user.blockExpires <= new Date(); // eslint-disable-line max-len

/**
 *
 * @param {Object} user - user object.
 */
const checkLoginAttemptsAndBlockExpires = async (user) => new Promise((resolve, reject) => {
  // Let user try to login again after blockexpires, resets user loginAttempts
  if (blockIsExpired(user)) {
    user.loginAttempts = 0; // eslint-disable-line no-param-reassign
    user.save((err, result) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message));
      }
      if (result) {
        resolve(true);
      }
    });
  } else {
    // User is not blocked, check password (normal behaviour)
    resolve(true);
  }
});

/** ******************
 * Public functions *
 ******************* */

/**
 * Login function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.login = async (req, res) => {
  try {
    const data = matchedData(req);
    const user = await findUser(data.email);
    await userIsBlocked(user);
    await checkLoginAttemptsAndBlockExpires(user);

    const isMobilePhoneValid = await auth.checkMobileNumber(data.msisdn);
    if (!isMobilePhoneValid) {
      utils.handleError(res, await mobileNumberNotValid(user));
    }

    const isPasswordMatch = await auth.checkPassword(data.password, user);
    if (!isPasswordMatch) {
      utils.handleError(res, await passwordsDoNotMatch(user));
    } else {
      // all ok, register access and return token
      user.loginAttempts = 0;
      await saveLoginAttemptsToDB(user);
      res.status(200).json(await saveUserAccessAndReturnToken(req, user));
    }
  } catch (error) {
    utils.handleError(res, error);
  }
};
