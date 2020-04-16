const nodemailer = require('nodemailer');
const mg = require('mailgun-js');
const { User } = require('../models');
const { itemAlreadyExists } = require('./utils');

/**
 * Sends email
 * @param {Object} data - data
 * @param {boolean} callback - callback
 */
const sendEmail = async (data, callback) => {
  const auth = {
    auth: {
      api_key: process.env.EMAIL_SMTP_API_MAILGUN,
      domain: process.env.EMAIL_SMTP_DOMAIN_MAILGUN,
    },
  };
  const transporter = nodemailer.createTransport(mg(auth));
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: `${data.user.name} <${data.user.email}>`,
    subject: data.subject,
    html: data.htmlMessage,
  };
  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return callback(false);
    }
    return callback(true);
  });
};

/**
 * Prepares to send email
 * @param {string} user - user object
 * @param {string} subject - subject
 * @param {string} htmlMessage - html message
 */
const prepareToSendEmail = (user, subject, htmlMessage) => {
  // eslint-disable-next-line no-param-reassign
  user = {
    name: user.name,
    email: user.email,
    verification: user.verification,
  };
  const data = {
    user,
    subject,
    htmlMessage,
  };
  if (process.env.NODE_ENV === 'production') {
    sendEmail(data, (messageSent) => (messageSent
      ? console.log(`Email SENT to: ${user.email}`)
      : console.log(`Email FAILED to: ${user.email}`)));
  } else if (process.env.NODE_ENV === 'development') {
    console.log(data);
  }
};

module.exports = {
  /**
   * Checks User model if user with an specific email exists
   * @param {string} email - user email
   */
  async emailExists(email) {
    return new Promise((resolve, reject) => {
      User.findOne({ where: { email } })
        .then((item) => {
          itemAlreadyExists('', item, reject, 'EMAIL_ALREADY_EXISTS');
          resolve(false);
        })
        .catch((err) => {
          itemAlreadyExists(err, '', reject, 'EMAIL_ALREADY_EXISTS');
          resolve(false);
        });
    });
  },

  /**
   * Checks User model if user with an specific email exists but excluding user id
   * @param {string} id - user id
   * @param {string} email - user email
   */
  async emailExistsExcludingMyself(id, email) {
    return new Promise((resolve, reject) => {
      User.findOne(
        {
          email,
          _id: {
            $ne: id,
          },
        },
        (err, item) => {
          itemAlreadyExists(err, item, reject, 'EMAIL_ALREADY_EXISTS');
          resolve(false);
        },
      );
    });
  },

  /**
   * Sends registration email
   * @param {Object} user - user object
   */
  async sendRegistrationEmailMessage(user) {
    const subject = 'Verify your email at Maskani';
    const htmlMessage = `<p>Hello ${user.name}.</p> <p>Welcome! To verify your email, please click in this link:</p>`
      + `<p>${process.env.FRONTEND_URL}/verify/${user.verification}</p> <p>Thank you.</p>`;
    prepareToSendEmail(user, subject, htmlMessage);
  },

  /**
   * Sends reset password email
   * @param {Object} user - user object
   */
  async sendResetPasswordEmailMessage(user) {
    const subject = 'Password recovery at Maskani';
    const htmlMessage = `<p>To recover the password for user: ${user.email}</p> <p>click the following link:</p>`
        + ` <p>${process.env.FRONTEND_URL}/reset/${user.verification}</p> <p>If this was a mistake, you can ignore this message.</p> <p>Thank you.</p>`;
    prepareToSendEmail(user, subject, htmlMessage);
  },
};
