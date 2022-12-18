const nodemailer = require('nodemailer');

const sendEmailNotification = (toEmail, emailContent) => {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'memorysocialapi@gmail.com',
      pass: 'pgqinqkmybeeomrp'
    }
  });

  return new Promise(resolve => {
    const mailOptions = {
      from: 'Memory Social <memorysocialapi@gmail.com>',
      to: toEmail,
      subject: 'Sending Email using Node.js',
      text: emailContent
    };
  
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        resolve(error);
      } else {
        resolve('Email sent: ' + info.response);
      }
    });
  });
}

module.exports = {
  sendEmailNotification
}