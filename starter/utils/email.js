const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text')
const pug = require('pug')
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email
    this.from = process.env.EMAIL_FROM
    this.url = url
    this.firstname = user.name.split(' ')[0]
  }
  newtransport() {
    if (process.env.NODE_ENV === 'production') {
      console.log('im here')
      return nodemailer.createTransport({
        host: process.env.BrevoHost,
        port: process.env.BrevoPort,
        secure:false,
        auth: {
          user: process.env.BrevoUsername,
          pass: process.env.BrevoPassword
        },
        tls: {
          // 👇 هذا السطر يسمح باستخدام شهادات SSL موقعة ذاتيًا
          rejectUnauthorized: false
        }
      });

    }
    return nodemailer.createTransport({
      host: process.env.EmailHost,
      port: process.env.EmailPort,
      auth: {
        user: process.env.EmailUsername,
        pass: process.env.EmailPassword
      }
    });
  }

  async send(subject, template) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      url: this.url,
      firstname: this.firstname,
      subject
    })
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html)
    }
    await this.newtransport().sendMail(mailOptions)
  }
  async sendWelcome() {
    await this.send('welcome to natours family', 'welcome')
  }
  async resetPassword() {
    await this.send('Your password reset token (valid for only 10 minutes)','resetpassword')
  }

}
