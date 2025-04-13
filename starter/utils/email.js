const nodemailer = require('nodemailer');

const sendmail = async options => {
  // first create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EmailHost,
    port: process.env.EmailPort,
    auth: {
      user: process.env.EmailUsername,
      pass: process.env.EmailPassword
    }
  });
  const mailOptions = {
    from: 'Mahmoud Abdelslam <admin@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.text
  };
  await transporter.sendMail(mailOptions);
};
module.exports = sendmail;
