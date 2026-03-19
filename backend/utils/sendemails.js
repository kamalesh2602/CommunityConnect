const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        console.log(`📡 Sending email to: ${to}...`);
        const info = await transporter.sendMail({
            from: "communityconnectpsg@gmail.com",
            to,
            subject,
            text
        });
        console.log(`✅ Email sent successfully: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`❌ Email send failed for ${to}:`, error.message);
        throw error;
    }
};

module.exports = sendEmail;