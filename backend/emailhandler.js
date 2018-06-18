const _ = require('lodash');
const mailer = require('nodemailer');
const config = require('./config.js')

class EmailHandler {
    constructor() {
        this.transport = mailer.createTransport({
            service: 'Gmail',
            auth: config.emailSender,
            tls: { rejectUnauthorized: false }
        }, {
            from: `ShoppingList <${config.emailSender.user}>`,
        })
    }

    sendEmailVerification(email, pw_hash) {
        this.transport.sendMail({
            to: email,
            subject: 'Email verfication',
            text: `
                Hello!

                Thanks for signing up with a ShoppingList account.
                Please verify your email address with the link below:

                http://${config.host}:${config.port}/verify?email=${email}&pw_hash=${pw_hash}

                You cannot log in before verifying your email.

            `,
        }, (err, res) => {
            if (err)
                console.log(err);
        });
    }
}

module.exports = new EmailHandler();
