const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendEmail = ({ recepient_email, OTP }) => {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.ADMIN_EMAIL,
                pass: process.env.EMAIL_PASSWD,
            },
        });

        const mail_configs = {
            from: process.env.ADMIN_EMAIL,
            to: recepient_email,
            subject: 'Stock-A-Mock Password Recovery...',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head><meta charset="UTF-8"><title>Stock-A-Mock : Get invested today.</title></head>
                <body>
                    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                        <div style="margin:50px auto;width:70%;padding:20px 0">
                            <div style="border-bottom:1px solid #eee">
                                <a href="#" style="font-size:1.4em;color:#00466a;text-decoration:none;font-weight:600">Stock-A-Mock</a>
                            </div>
                            <p style="font-size:1.1em">Hi,</p>
                            <p>Thank you for choosing Stock-A-Mock.</p>
                            <p>Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
                            <h2 style="background:#00466a;margin:0 auto;width:max-content;padding:0 10px;color:#fff;border-radius:4px;">${OTP}</h2>
                            <p style="font-size:0.9em;">Regards,<br />Smart Investors Team</p>
                            <hr style="border:none;border-top:1px solid #eee" />
                            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                                <p>Stock-A-Mock Inc</p>
                                <p>Engineering College Hostels</p>
                                <p>College of Engineering Guindy</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>`,
        };

        transporter.sendMail(mail_configs, function (error, info) {
            if (error) {
                console.log(error);
                return reject({ message: "Failed to send E-mail" });
            }
            return resolve({ message: "Email sent successfully!" });
        });
    });
};

const signupEmail = ({ recepient_email, OTP }) => {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.ADMIN_EMAIL,
                pass: process.env.EMAIL_PASSWD,
            },
        });

        const mail_configs = {
            from: process.env.ADMIN_EMAIL,
            to: recepient_email,
            subject: 'Stock-A-Mock Verification to Register New User...',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head><meta charset="UTF-8"><title>Stock-A-Mock : Get invested today.</title></head>
                <body>
                    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                        <div style="margin:50px auto;width:70%;padding:20px 0">
                            <div style="border-bottom:1px solid #eee">
                                <a href="#" style="font-size:1.4em;color:#00466a;text-decoration:none;font-weight:600">Stock-A-Mock</a>
                            </div>
                            <p style="font-size:1.1em">Hi,</p>
                            <p>Thank you for choosing Stock-A-Mock.</p>
                            <p>Use the following OTP to complete your email verification. OTP is valid for 5 minutes</p>
                            <h2 style="background:#00466a;margin:0 auto;width:max-content;padding:0 10px;color:#fff;border-radius:4px;">${OTP}</h2>
                            <p style="font-size:0.9em;">Regards,<br />Smart Investors Team</p>
                            <hr style="border:none;border-top:1px solid #eee" />
                            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                                <p>Stock-A-Mock Inc</p>
                                <p>Engineering College Hostels</p>
                                <p>College of Engineering Guindy</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>`,
        };

        transporter.sendMail(mail_configs, function (error, info) {
            if (error) {
                console.log(error);
                return reject({ message: "Failed to send E-mail" });
            }
            return resolve({ message: "Email sent successfully!" });
        });
    });
};

module.exports = { sendEmail, signupEmail };