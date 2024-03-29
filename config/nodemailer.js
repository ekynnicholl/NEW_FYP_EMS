import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    // Login credentials for the gmail account,
    auth: {
        user: 'fypemsmaster369@gmail.com',
        pass: 'lxsw qfhm bzev nstm'
        // user: 'swinburneacademicoffice@gmail.com',
        // pass: 'omhn bvmc ymxx lvuh'
    }
});

export const mailOptions = {
    from: 'acad.admin_servicedesk <fypemsmaster369@gmail.com>',
    // Change this to the AAO service desk,
    to: 'swinburneacademicoffice@gmail.com',
}