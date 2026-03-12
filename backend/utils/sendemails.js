const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "communityconnectpsg@gmail.com",
        pass: "zrqy uump bmfl blur"
    }
});

const sendEmail = async (to, subject, text) => {

    await transporter.sendMail({
        from: "communityconnectpsg@gmail.com",
        to,
        subject,
        text
    });

};

module.exports = sendEmail;