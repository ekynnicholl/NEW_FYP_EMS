import { NextResponse } from "next/server";
import { mailOptions, transporter } from "@/config/nodemailer";

const url = process.env.NEXT_PUBLIC_WEBSITE_URL;

// To handle a GET request to /ap
export async function GET(request: Request) {
    return NextResponse.json({ request }, { status: 200 });
}

// type 1: approval/ rejection, type 2: rejection, type 3: approved, type 4: reverted email to staff, type 5: form has been received
function generateEmailHTML(process: string, formID: string, type: number, optionalFields?: string, optionalFields2?: string, optionalFields3?: string) {
    const link = `${url}/form/external/${formID}`;
    const linkForAAO = `<span style="font-weight: bold;">Link:</span> <a href="${url}/external/${formID}">${url}/external/${formID}</a>`;

    // To HMU/ Dean/ HOS/ ADCR/ MGR = Stage 3 and 4.
    if (type == 1) {
        let securityKeySentence = "";
        let securityKey = "";

        if (optionalFields && optionalFields.trim() !== "") {
            securityKeySentence = `
                <p class="no-p-m"><span style="font-weight: bold;">[IMPORTANT!]</span> This link contains a security key, please <span style="font-weight: bold;">DO NOT CHANGE</span> the link: <br/><a href="${link}?secKey=${optionalFields}"><span style="font-weight: bold;">${link}?secKey=${optionalFields}</span></a></p>
                <br/>
                <p class="no-p-m">Please take note that the following Security Key is sent solely to your email and will be rendered expired immediately after usage.</p>
            `;

            securityKey = `
                <p class="no-p-m" style="font-weight: bold;">Security Key: ${optionalFields} </p>
            `;
        } else {
            securityKeySentence = 'Security key not found. Please refer to user manual for more assistance (ERRNTF_3).'

            securityKey = securityKeySentence;
        }

        let staffDetails = "";

        if (optionalFields2 && optionalFields2.trim() !== "") {
            staffDetails = optionalFields2;
        } else {
            staffDetails = 'Staff details not found. Please refer to user manual for more assistance (ERRNTF_1_T1).'
        }

        let aaoEmail = optionalFields3 ? optionalFields3 : 'Officer email not found. Please refer to user manual for more assistance (ERRNTF_2_T1).';

        return `
        <html>
            <head>
                <style>
                    .email-container {
                        padding: 20px;
                        max-width: 1400px; 
                        margin: 0 auto;
                    }
                    .no-p-m{
                        margin: 0px;
                        padding: 0px;
                    }
                    body{
                        text-align: justify;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png" alt="Image Description" height="150px" width="300px">
                    <h2 class="no-p-m">Dear Sir/ Ms/ Mdm,</h2>
                    <br/>
                    <p class="no-p-m">There is currently a <span style="font-weight: bold;">Nominations/ Travelling Form (NTF) pending for approval/ rejection </span> from <span style="font-weight: bold;">${staffDetails}</span>. Please click the link below for your next action.</p>
                    <br/>
                    <p class="no-p-m">${securityKeySentence.trim() === "" ? link : securityKeySentence}</p>
                    ${securityKey}
                    <br/>
                    <p class="no-p-m">If you have inquiries regarding the forms, you may contact the Academic Admin Officer handling this form: ${aaoEmail}</p>
                    <br/>
                    <p class="no-p-m">We're committed to ensuring your user experience is as seamless and hassle free as possible. Thank you for using our system.</p>
                    <br/>
                    <span style="font-weight:bold;">Process Level:</span> ${process}
                    <br/>
                    <br/>
                    <p class="no-p-m">We're committed to ensuring your user experience is as seamless and hassle free as possible. Thank you for using our system.</p>
                    <br/>
                    <p class="no-p-m">Regards, <br/> Event Management and Attendance Tracking (EMAT) Developer Team</p>
                    </p>
                </div>
            </body>
        </html>
        `;










        // Rejected email,
    } else if (type == 2) {
        let rejectMessage = "";

        if (optionalFields && optionalFields.trim() !== "") {
            rejectMessage = `
                <br/>
                <br/>
                <p class="no-p-m" style="font-weight:bold;"> Reason(s) of Rejection: </p>
                <p class="no-p-m">${optionalFields}</p>
                <br/>
            `;
        } else {
            rejectMessage = 'Failed to retrieve reason. Please refer to user manual for more assistance (ERRNTF_4_T2).'
        }

        let aaoEmail = optionalFields2 ? optionalFields2 : 'Officer email not found. Please refer to user manual for more assistance (ERRNTF_2_T2).';

        return `
        <html>
            <head>
                <style>
                    .email-container {
                        padding: 20px;
                        max-width: 1400px; 
                        margin: 0 auto;
                    }
                    .no-p-m{
                        margin: 0px;
                        padding: 0px;
                    }
                    
                </style>
            </head>
            <body>
                <div class="email-container">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png" alt="Image Description" height="150px" width="300px">
                    <h2 class="no-p-m">Dear Sir/ Ms/ Mdm,</h2>
                    <br/>
                    <p class="no-p-m">We regret to inform you that your <span style="font-weight:bold;">Nominations/ Travelling Form application</span> has been rejected, please refer to the reasons below. You may review your previous submission in the link below (in PDF format). </p>
                    <br/>
                    <span style="font-weight:bold;">Link:</span> <a href="${link}" style="color: #0070f3; text-decoration: underline;" class="no-p-m">${link}</a>
                    ${rejectMessage}
                    <p class="no-p-m" style="text-align: text-left;">If you have inquiries regarding your application, you may contact the following assigned Academic Admin Officer handling this submission: ${aaoEmail}</p>
                    <br/>
                    <span style="font-weight:bold;">Process Level: </span> ${process}
                    <br/>
                    <br/>
                    <p class="no-p-m">We're committed to ensuring your user experience is as seamless and hassle free as possible. Thank you for using our system.</p>
                    <br/>
                    <p class="no-p-m">Regards, <br/> Event Management and Attendance Tracking (EMAT) Developer Team</p>
                    </p>
                </div>
            </body>
        </html>
        `;













        // Approved email,
    } else if (type == 3) {
        return `
        <html>
            <head>
                <style>
                    .email-container {
                        padding: 20px;
                        max-width: 1400px; 
                        margin: 0 auto;
                    }
                    .no-p-m{
                        margin: 0px;
                        padding: 0px;
                    }
                    body{
                        text-align: justify;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png" alt="Image Description" height="150px" width="300px">
                    
                    <h2 class="no-p-m">Dear Sir/ Ms/ Mdm,</h2>
                    <br/>
                    <p class="no-p-m">Pleased to inform you that your <span style="font-weight:bold;">Nominations/ Travelling Form (NTF) application</span> has been approved! You may view or print the PDF version via the link below.</p>
                    <p><span style="font-weight:bold;">Link:</span> <a href="${link}" style="color: #0070f3; text-decoration: underline;" class="no-p-m">${link}</a></p>
                    <span style="font-weight:bold;">Process Level:</span> ${process}
                    <br/>
                    <br/>
                    <p class="no-p-m">We're committed to ensuring your user experience is as seamless and hassle free as possible. Thank you for using our system.</p>
                    <br/>
                    <p class="no-p-m">Regards, <br/> Event Management and Attendance Tracking (EMAT) Developer Team</p>
                    </p>
                </div>
            </body>
        </html>
        `;










        // Reverted email,
    } else if (type == 4) {
        let securityKeySentence = "";
        let securityKey = "";

        if (optionalFields2 && optionalFields2.trim() !== "") {
            securityKeySentence = `
                <p><span style="font-weight: bold;">[IMPORTANT!]</span> This link contains a security key, please <span style="font-weight: bold;">DO NOT CHANGE</span> the link: <br/><span style="font-weight:bold;">Link:</span> <a href="${link}/?secKey=${optionalFields2}" style="color: #0070f3; text-decoration: underline;" class="no-p-m"><span style="font-weight: bold;">${link}/?secKey=${optionalFields2}</span></a></p>
                <p>Please take note that the following Security Key is sent solely to your email and will be rendered expired immediately after usage.</p>
            `;

            securityKey = `
                <p class="no-p-m" style="font-weight: bold;">Security Key: ${optionalFields2} </p>
            `;
        } else {
            securityKeySentence = 'Security key not found. Please refer to user manual for more assistance (ERRNTF_3_T4).'

            securityKey = securityKeySentence;
        }

        let aaoEmail = optionalFields3 ? optionalFields3 : 'Officer email not found. Please refer to user manual for more assistance (ERRNTF_2_T4).';

        return `
        <html>
            <head>
                <style>
                    .email-container {
                        padding: 20px;
                        max-width: 1400px; 
                        margin: 0 auto;
                    }
                    .no-p-m{
                        margin: 0px;
                        padding: 0px;
                    }
                    body{
                        text-align: justify;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png" alt="Image Description" height="150px" width="300px">
                    
                    <h2 class="no-p-m">Dear Sir/ Ms/ Mdm,</h2>
                    <br/>
                    <p class="no-p-m">Your <span style="font-weight:bold;">Nominations/ Travelling Form (NTF) application</span> has been reverted to you for further changes, which you may refer to the reason(s) below. Please click the link below for your next action.</p>
                    ${securityKeySentence}
                    ${securityKey}
                    <br/>
                    <p class="no-p-m" style="font-weight:bold;"> Reason(s) of Reverting: </p>
                    <p class="no-p-m">${optionalFields}</p>
                    <!-- <br/>
                    <p class="no-p-m">If you have inquiries regarding the forms, you may contact the Academic Admin Officer handling this form: ${aaoEmail}</p> -->
                    <br/>
                    <span style="font-weight:bold;">Process Level:</span> ${process}
                    <br/>
                    <br/>
                    <p class="no-p-m">We're committed to ensuring your user experience is as seamless and hassle free as possible. Thank you for using our system.</p>
                    <br/>
                    <p class="no-p-m">Regards, <br/> Event Management and Attendance Tracking (EMAT) Developer Team</p>
                    </p>
                </div>
            </body>
        </html>
        `;






        // To applicant after submission email,
    } else if (type == 5) {
        return `
        <html>
            <head>
                <style>
                    .email-container {
                        padding: 20px;
                        max-width: 1400px; 
                        margin: 0 auto;
                    }
                    .no-p-m{
                        margin: 0px;
                        padding: 0px;
                    }
                    body{
                        text-align: justify;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png" alt="Image Description" height="150px" width="300px">
                    
                    <h2 class="no-p-m">Dear Sir/ Ms/ Mdm,</h2>
                    <br/>
                    <p class="no-p-m">Please be informed that your <span style="font-weight:bold;">Nominations/ Travelling Form application</span> has been submitted. The Academic Administration Office
                    will assign an officer to process your application. Please allow us some time to process within 2 to 3 working days.</p>
                    <br/>
                    <p class="no-p-m">You will receive an email notification regarding your application status if there are any changes required to be made, approved or rejected.</p>
                    <br/>
                    <p class="no-p-m">If you have any questions, please do not hesitate to contact us at fypemsmaster369@gmail.com</p>
                    <br/>
                    <p class="no-p-m">You may review your submitted form here:</p>
                    <span style="font-weight:bold;">Link:</span> <a href="${link}" style="color: #0070f3; text-decoration: underline;" class="no-p-m">${link}</a>
                    <br/>
                    <br/>
                    <span style="font-weight:bold;">Process Level:</span> ${process}
                    <br/>
                    <br/>
                    <p class="no-p-m">We're committed to ensuring your user experience is as seamless and hassle free as possible. Thank you for using our system.</p>
                    <br/>
                    <p class="no-p-m">Regards, <br/> Event Management and Attendance Tracking (EMAT) Developer Team</p>
                    </p>
                </div>
            </body>
        </html>
        `;











        // To AAO email,
    } else if (type == 6) {
        let staffDetails = "";

        if (optionalFields2 && optionalFields2.trim() !== "") {
            staffDetails = optionalFields2;
        } else {
            staffDetails = "Staff details not found. Please refer to user manual for more assistance (ERRNTF_1_T6)."
        }

        return `
        <html>
            <head>
                <style>
                    .email-container {
                        padding: 20px;
                        max-width: 1400px; 
                        margin: 0 auto;
                    }
                    .no-p-m{
                        margin: 0px;
                        padding: 0px;
                    }
                    body{
                        text-align: justify;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png" alt="Image Description" height="150px" width="300px">
                    <h2 class="no-p-m">Dear Academic Administration Office Staff,</h2>
                    <br/>
                    <p class="no-p-m">There is currently a <span style="font-weight:bold;">Nominations/ Travelling Form (NTF) application</span> pending for your review and confirmation with the applicant before forwarding it to the respective Verifier/ Approver from <span style="font-weight: bold;">${staffDetails}</span>. You may view the applicant submission via the Event
                    Management System or you can click the link below to take the next action: </p>
                    <br/>
                    <p class="no-p-m">${linkForAAO}</p>
                    <br/>
                    <br/>
                    <span style="font-weight:bold;">Process Level: </span> ${process}
                    <br/>
                    <br/>
                    <p class="no-p-m">We're committed to ensuring your user experience is as seamless and hassle free as possible. Thank you for using our system.</p>
                    <br/>
                    <p class="no-p-m">Regards, <br/> Event Management and Attendance Tracking (EMAT) Developer Team</p>
                    </p>
                </div>
            </body>
        </html>
        `;
    }






    // Request for appeal to AAO,
    else if (type == 7) {
        let staffDetails = "";
        let appealComment = "";

        if (optionalFields && optionalFields.trim() !== "") {
            staffDetails = optionalFields;
        } else {
            staffDetails = "Staff details not found. Please refer to user manual for more assistance (ERRNTF_1_T6)."
        }

        if (optionalFields2 && optionalFields2.trim() !== "") {
            appealComment = optionalFields2;
        } else {
            appealComment = "Appeal comment not found."
        }

        return `
        <html>
            <head>
                <style>
                    .email-container {
                        padding: 20px;
                        max-width: 1400px; 
                        margin: 0 auto;
                    }
                    .no-p-m{
                        margin: 0px;
                        padding: 0px;
                    }
                    body{
                        text-align: justify;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png" alt="Image Description" height="150px" width="300px">
                    <h2 class="no-p-m">Dear Academic Administration Office Staff,</h2>
                    <br/>
                    <p class="no-p-m">An appeal has been submitted for the <span style="font-weight:bold;">Nominations/ Travelling Form application</span>: ${staffDetails}. You may view the forms via the Event Management System or you can click the link below to take the next action:</p>
                    <br/>
                    <p class="no-p-m">${linkForAAO}</p>
                    <br/>
                    <p class="no-p-m" style="font-weight:bold;">The request attached to the appeal:</p>
                    <p class="no-p-m" style="font-weight:bold;">${appealComment}</p>
                    <br/>
                    <span style="font-weight:bold;">Process Level: </span> ${process}
                    <br/>
                    <br/>
                    <p class="no-p-m">We're committed to ensuring your user experience is as seamless and hassle free as possible. Thank you for using our system.</p>
                    <br/>
                    <p class="no-p-m">Regards, <br/> Event Management and Attendance Tracking (EMAT) Developer Team</p>
                    </p>
                </div>
            </body>
        </html>
        `;
    }


    // Appeal request received to staff,
    else if (type == 8) {
        let aaoEmail = "";

        if (optionalFields2 && optionalFields2.trim() !== "") {
            aaoEmail = `<a href='mailto:${optionalFields2}'>${optionalFields2}</a>`;
        } else {
            aaoEmail = "Appeal comment not found."
        }

        return `
        <html>
            <head>
                <style>
                    .email-container {
                        padding: 20px;
                        max-width: 1400px; 
                        margin: 0 auto;
                    }
                    .no-p-m{
                        margin: 0px;
                        padding: 0px;
                    }
                    body{
                        text-align: justify;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png" alt="Image Description" height="150px" width="300px">
                    <h2 class="no-p-m">Dear Sir/ Ms/ Mdm,</h2>
                    <br/>
                    <p class="no-p-m">Please be informed that your <span style="font-weight:bold;">Nominations/ Travelling Form application</span> appeal has been received. Please allow us some time to process within 2 to 3 working days.</p>
                    <br/>
                    <p class="no-p-m">You will receive an email notification regarding your application status if your appeal is successful.</p>
                    <br/>
                    <p class="no-p-m">If you have any questions, you may contact the staff handling your application: ${aaoEmail}</p>
                    <br/>
                    <span style="font-weight:bold;">Process Level: </span> ${process}
                    <br/>
                    <br/>
                    <p class="no-p-m">We're committed to ensuring your user experience is as seamless and hassle free as possible. Thank you for using our system.</p>
                    <br/>
                    <p class="no-p-m">Regards, <br/> Event Management and Attendance Tracking (EMAT) Developer Team</p>
                    </p>
                </div>
            </body>
        </html>
        `;
    }
    else {
        return `
        <html>
            <head>
            </head>
            <body>
                <div class="email-container">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png" alt="Image Description" height="150px" width="250px">
                    <p>There was no email template specified when creating this email.</p>
                    <p>ERROR. Please contact the server administrator! </p>
                </div>
            </body>
        </html>
        `;
    }
}

export async function POST(request: Request) {
    try {
        const tempData = await request.json();
        const requestData = tempData[0];

        const formStage = requestData.formStage;
        const formID = requestData.id;
        const staffEmail = requestData.email;
        const formDetails = requestData.full_name + " (" + requestData.staff_id + ") - " + requestData.program_title;
        const verificationEmail = requestData.verification_email;
        const approvalEmail = requestData.approval_email;
        const staffName = requestData.full_name;
        const staffID = requestData.staff_id;
        const aaoEmail = requestData.aao_email;

        // Debugging statements,
        // console.log("Debugging Form Stage: " + formStage);
        // console.log('Received request data:', requestData);

        if (formStage === 2) {
            const recipients = ['swinburneacademicoffice@gmail.com', staffEmail];
            // const recipients = ['jadpichoo@outlook.com', staffEmail];
            const formIDs = [6, 5];
            // Debugging statements,
            // console.log("Started sending email process: ")

            for (let i = 0; i < recipients.length; i++) {
                const mailOptionsCopy = { ...mailOptions };
                mailOptionsCopy.to = recipients[i];
                // Debugging statements,
                // console.log("Sending email: " + recipients[i])

                const formIDForRecipient = formIDs[i];
                // console.log(formIDForRecipient);

                // It sends to AAO first, then to the staff,
                if (i == 0) {
                    await transporter.sendMail({
                        ...mailOptionsCopy,
                        subject: `[NTF - To Review by AAO] ${staffName} (${staffID})`,
                        text: "[Academic Admin Office Level: Staff to Academic Administration Office]",
                        html: generateEmailHTML("[Academic Admin Office Level: Staff to Academic Administration Office]", formID, formIDForRecipient, '', formDetails)
                    });
                } else {
                    await transporter.sendMail({
                        ...mailOptionsCopy,
                        subject: `[NTF - Under Review] ${staffName} (${staffID})`,
                        text: "[Applicant Level: Academic Administration Office to Staff]",
                        html: generateEmailHTML("[Applicant Level: Academic Administration Office to Staff]", formID, formIDForRecipient, '', formDetails)
                    });
                }
            }
        } else if (formStage === 3) {
            const mailOptionsCopy = { ...mailOptions };
            mailOptionsCopy.to = verificationEmail;
            // Debugging statements,
            // console.log("Started sending email process: " + verificationEmail)
            await transporter.sendMail({
                ...mailOptionsCopy,
                subject: `[NTF - To Verify and Support] ${staffName} (${staffID})`,
                text: "[Approver Level: Final Review & Approval to Head of School/ Associate Dean of Research/ Manager to Head of Management Unit/ Dean]",
                html: generateEmailHTML("[Verifier Level: Review & Approval by HOS/ACDR/MGR]", formID, 1, requestData.securityKey, formDetails, aaoEmail)
            });

        } else if (formStage === 4) {
            const mailOptionsCopy = { ...mailOptions };
            mailOptionsCopy.to = approvalEmail;
            // Debugging statements,
            // console.log("Started sending email process: " + approvalEmail)
            await transporter.sendMail({
                ...mailOptionsCopy,
                subject: `[NTF - Final Review & Approval Dean/ HMU] ${staffName} (${staffID})`,
                text: "[Approver Level: Final Review & Approval by Head of School/ Associate Dean of Research/ Manager to Head of Management Unit/ Dean]",
                html: generateEmailHTML("[Approver Level: Final Review & Approval by Head of School/ Associate Dean of Research/ Manager to Head of Management Unit/ Dean]", formID, 1, requestData.securityKey, formDetails, aaoEmail)
            });
        } else if (formStage === 6) {
            const recipients = ['swinburneacademicoffice@gmail.com', staffEmail];
            for (const recipient of recipients) {
                const mailOptionsCopy = { ...mailOptions };
                mailOptionsCopy.to = recipient;
                await transporter.sendMail({
                    ...mailOptionsCopy,
                    subject: `[NTF - Rejected Application] ${staffName} (${staffID})`,
                    text: "[Applicant Level: Rejected Nomination/Traveling Form Application]",
                    html: generateEmailHTML("[Applicant Level: Rejected Nomination/Traveling Form Application]", formID, 2, requestData.revertComment, aaoEmail)
                });
            }
        } else if (formStage === 1) {
            const mailOptionsCopy = { ...mailOptions };
            mailOptionsCopy.to = staffEmail;
            // Debugging statements,
            // console.log("Debugging reverted comment: " + requestData.revertComment);
            await transporter.sendMail({
                ...mailOptionsCopy,
                subject: `[NTF - Reverted to Staff] ${staffName} (${staffID})`,
                text: "[Applicant Level: Academic Administration Office to Staff]",
                html: generateEmailHTML("[Applicant Level: Academic Administration Office to Staff]", formID, 4, requestData.revertComment, requestData.securityKey, aaoEmail)
            });
        } else if (formStage === 5) {
            const recipients = ['swinburneacademicoffice@gmail.com', staffEmail];
            for (const recipient of recipients) {
                const mailOptionsCopy = { ...mailOptions };
                mailOptionsCopy.to = recipient;
                await transporter.sendMail({
                    ...mailOptionsCopy,
                    subject: `[NTF - Approved] ${staffName} (${staffID})`,
                    text: "[Applicant Level: Approved Nomination/Traveling Form Application]",
                    html: generateEmailHTML("[Applicant Level: Approved Nomination/Traveling Form Application]", formID, 3)
                });
            }
        } else if (formStage === 7) {
            const recipients = ['swinburneacademicoffice@gmail.com', staffEmail];
            // const recipients = ['jadpichoo@outlook.com', staffEmail];
            const formIDs = [7, 8];
            // Debugging statements,
            // console.log("Started sending email process: ")

            for (let i = 0; i < recipients.length; i++) {
                const mailOptionsCopy = { ...mailOptions };
                mailOptionsCopy.to = recipients[i];

                const formIDForRecipient = formIDs[i];

                // It sends to AAO first, then to the staff,
                if (i == 0) {
                    await transporter.sendMail({
                        ...mailOptionsCopy,
                        subject: `[NTF - Appeal Request] ${staffName} (${staffID})`,
                        text: "[Academic Admin Office Level: Staff to Academic Administration Office]",
                        html: generateEmailHTML("[Academic Admin Office Level: Staff to Academic Administration Office]", formID, formIDForRecipient, formDetails, requestData.revertComment)
                    });
                } else {
                    await transporter.sendMail({
                        ...mailOptionsCopy,
                        subject: `[NTF - Appeal Request] ${staffName} (${staffID})`,
                        text: "[Applicant Level: Academic Administration Office to Staff]",
                        html: generateEmailHTML("[Applicant Level: Academic Administration Office to Staff]", formID, formIDForRecipient, formDetails, aaoEmail)
                    });
                }
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
