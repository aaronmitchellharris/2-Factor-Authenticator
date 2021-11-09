const nodemailer = require('nodemailer');
const login = require('./email_login');

const sendEmail = (recipient, code) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: login.user,
            pass: login.pass
        }
    });

    let mailOptions = {
        from: login.user,
        to: recipient,
        subject: 'One Time Password - 2FA CS361',
        text: 'Your One Time Password: ' + String(code)
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response)
        }
    });
};

sendEmail('aaronmitchellharris@gmail.com', 123456);

module.exports = {
    sendEmail
};