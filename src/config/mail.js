credentials = process.env
const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
  host: credentials.MAIL_HOST,
  port: credentials.MAIL_PORT,
  auth: {
    user: credentials.MAIL_USER,
    pass: credentials.MAIL_PASS
  }
});

module.exports= { transport }