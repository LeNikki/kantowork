const nodemailer = require('nodemailer');

// SMTP settings come from .env. Any provider works (Gmail, Fastmail, SES, ...)
// as long as these four values are filled in - see .env.example.
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

const configured = SMTP_HOST && SMTP_USER && SMTP_PASS;

// Without SMTP the app must still work in development, otherwise nobody can
// test the flow without real credentials. So fall back to a null transport that
// accepts everything, and print the message to the console instead of sending it.
// console.log of a transport "message" gives a JSON envelope, so read .message.
let transport;

if (configured) {
    transport = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        // 465 is implicit TLS; 587 is STARTTLS. Most providers use 587.
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
} else {
    transport = nodemailer.createTransport({ jsonTransport: true });
    console.warn(
        '[mailer] SMTP_HOST/SMTP_USER/SMTP_PASS are not set - emails will be ' +
        'printed to the console instead of sent. Set them in .env to send for real.'
    );
}

// Single funnel for every outbound message, so "did it actually send" is
// answerable in one place instead of guessed at from call sites.
const sendMail = async (options) => {
    const info = await transport.sendMail({ from: MAIL_FROM || SMTP_USER, ...options });

    if (!configured) {
        console.log(
            '[mailer] SMTP not configured, printing message instead of sending it.\n' +
            JSON.stringify(info.message, null, 2)
        );
    } else {
        console.log(`[mailer] sent "${options.subject}" to ${options.to} (${info.messageId})`);
    }

    return info;
};

module.exports = { sendMail, configured };