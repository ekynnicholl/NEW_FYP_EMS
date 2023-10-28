import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: 'fypemsmaster369@gmail.com',
        pass: 'lxsw qfhm bzev nstm'
    }
});

export const mailOptions = {
    from: 'fypemsmaster369@gmail.com',
    to: 'fypemsmaster369@gmail.com',
}