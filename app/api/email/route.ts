import { NextResponse } from "next/server";
import { mailOptions, transporter } from "@/config/nodemailer";

const url = process.env.NEXT_PUBLIC_WEBSITE_URL;

// To handle a GET request to /ap
export async function GET(request: Request) {
    return NextResponse.json({ request }, { status: 200 });
}

// type 1: approval/ rejection, type 2: rejection, type 3: approved, type 4: reverted email to staff, type 5: form has been received
function generateEmailHTML(process: string, formID: string, type: number, optionalFields?: string, optionalFields2?: string) {
    const link = `${url}/form/external/${formID}`;
    const linkForAAO = `<span style="font-weight: bold;">Link:</span> ${url}/external/${formID}`;

    // To HMU/ Dean/ HOS/ ADCR/ MGR = Stage 3 and 4.
    if (type == 1) {
        let securityKeySentence = "";
        let securityKey = "";

        if (optionalFields && optionalFields.trim() !== "") {
            securityKeySentence = `
                <p class="no-p-m"><span style="font-weight: bold;">[IMPORTANT!]</span> This link contains a security key, please <span style="font-weight: bold;">DO NOT CHANGE</span> the link: <br/><span style="font-weight: bold;">${link}?secKey=${optionalFields}</span></p>
                <br/>
                <p class="no-p-m">Please take note that the following Security Key is sent solely to your email and will be rendered expired immediately after usage.</p>
            `;

            securityKey = `
                <p class="no-p-m" style="font-weight: bold;">Security Key: ${optionalFields} </p>
            `;
        }

        let staffDetails = "";

        if (optionalFields2 && optionalFields2.trim() !== "") {
            staffDetails = optionalFields2;
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
                    <p class="no-p-m">There is currently a <span style="font-weight: bold;">Nominations/ Travelling Form (NTF) pending for approval/ rejection </span> from ${staffDetails}. Please click the link below for your next action.</p>
                    <br/>
                    <p class="no-p-m">${securityKeySentence.trim() === "" ? link : securityKeySentence}</p>
                    ${securityKey}
                    <br/>
                    <p class="no-p-m">We're committed to ensuring your user experience is as seamless and hassle free as possible. Thank you for using our system.</p>
                    <br/>
                    Process Level: ${process}
                    <br/>
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
                <p class="no-p-m" style="font-weight:bold;">${optionalFields}</p>
                <br/>
            `;
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
                    <p class="no-p-m">We regret to inform you that your Nominations/ Travelling Form has been rejected. You may review the PDF version of it here: </p>
                    <br/>
                    Link: <a href="${link}" style="color: #0070f3; text-decoration: underline;" class="no-p-m">${link}</a>
                    ${rejectMessage}
                    <p class="no-p-m">We're committed to ensuring your user experience is as seamless and hassle free as possible. Thank you for using our system.</p>
                    <br/>
                    Process Level: ${process}
                    <br/>
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
                    <p class="no-p-m">Pleased to inform you that your Nominations/ Travelling Form has been approved! You may view or print the PDF version via the link below:</p>
                    <p>Link: <a href="${link}" style="color: #0070f3; text-decoration: underline;" class="no-p-m">${link}</a></p>
                    <p class="no-p-m">We're committed to ensuring your user experience is as seamless and hassle free as possible. Thank you for using our system.</p>
                    <br/>
                    Process Level: ${process}
                    <br/>
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
                <p><span style="font-weight: bold;">[IMPORTANT!]</span> This link contains a security key, please <span style="font-weight: bold;">DO NOT CHANGE</span> the link: <br/>Link: <a href="${link}/?secKey=${optionalFields2}" style="color: #0070f3; text-decoration: underline;" class="no-p-m"><span style="font-weight: bold;">${link}/?secKey=${optionalFields2}</span></a></p>
                <p>Please take note that the following Security Key is sent solely to your email and will be rendered expired immediately after usage.</p>
            `;

            securityKey = `
                <p class="no-p-m" style="font-weight: bold;">Security Key: ${optionalFields2} </p>
            `;
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
                    <p class="no-p-m">Your form has been reverted to you for further changes, which you may refer to the reason(s) below. Please click the link below for your next action.</p>
                    ${securityKeySentence}
                    ${securityKey}
                    <br/>
                    <p class="no-p-m" style="font-weight:bold;"> Reason(s) of Reverting: </p>
                    <p class="no-p-m" style="font-weight:bold;">${optionalFields}</p>
                    <br/>
                    <p class="no-p-m">We're committed to ensuring your user experience is as seamless and hassle free as possible. Thank you for using our system.</p>
                    <br/>
                    Process Level: ${process}
                    <br/>
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
                    
                    <h2 class="no-p-m">Dear sir/ ma'am,</h2>
                    <br/>
                    <p class="no-p-m" style="text-align: justify;">This email serves to inform you that your Nominations/ Travelling Form has been received at our end. You will only be updated if there are any changes required to be made,
                    approved or rejected. If you have any questions, please do not hesitate to contact us at fypemsmaster369@gmail.com</p>
                    <br/>
                    <p class="no-p-m">You may review your submitted form here:</p>
                    <a href="${link}" style="color: #0070f3; text-decoration: underline;" class="no-p-m">${link}</a>
                    <br/>
                    <br/>
                    <p class="no-p-m">We're committed to ensuring your user experience is as seamless and hassle free as possible. Thank you for using our system.</p>
                    <br/>
                    Process: ${process}
                    <br/>
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
                    <p class="no-p-m">There is currently a Nominations/ Travelling Form (NTF) pending for your review and confirmation with the applicant before forwarding it ot the respective Verifier/ Approver from <span style="font-weight: bold;">${staffDetails}</span>. You may view the applicant submission via the Event
                    Management System or you can click the link below to take the next action: </p>
                    <br/>
                    <p class="no-p-m">${linkForAAO}</p>
                    <br/>
                    <p class="no-p-m">We're committed to ensuring your user experience is as seamless and hassle free as possible. Thank you for using our system.</p>
                    <br/>
                    Process Level: ${process}
                    <br/>
                    <br/>
                    <p class="no-p-m">Regards, <br/> Event Management and Attendance Tracking (EMAT) Developer Team</p>
                    </p>
                </div>
            </body>
        </html>
        `;
    } else {
        return `
        <html>
            <head>
            </head>
            <body>
                <div class="email-container">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png" alt="Image Description" height="150px" width="250px">
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
                        subject: `[NTF - TO REVIEW] ${staffName} (${staffID}) - Nominations Travelling Form`,
                        text: "[Academic Admin Office Level - Staff to Academic Administration Office]",
                        html: generateEmailHTML("[Academic Admin Office Level - Staff to Academic Administration Office]", formID, formIDForRecipient, '', formDetails)
                    });
                } else {
                    await transporter.sendMail({
                        ...mailOptionsCopy,
                        subject: `[NTF - SUBMITTED SUCCESSFULLY] ${staffName} (${staffID}) - Nominations Travelling Form`,
                        text: "[Applicant Level - Submission Success]",
                        html: generateEmailHTML("[Applicant Level - Submission Success]", formID, formIDForRecipient, '', formDetails)
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
                subject: `[NTF - TO VERIFY & SUPPORT REMINDER] ${staffName} (${staffID}) - Nominations Travelling Form`,
                text: "[Approver Level: Final Review & Approval to Head of School/ Associate Dean of Research/ Manager to Head of Management Unit/ Dean]",
                html: generateEmailHTML("[Verifier Level: Review & Approval Reminder to to HOS/ACDR/MGR]", formID, 1, requestData.securityKey, formDetails)
            });

        } else if (formStage === 4) {
            const mailOptionsCopy = { ...mailOptions };
            mailOptionsCopy.to = approvalEmail;
            // Debugging statements,
            // console.log("Started sending email process: " + approvalEmail)
            await transporter.sendMail({
                ...mailOptionsCopy,
                subject: `[NTF - TO REVIEW & APPROVE REMINDER] ${staffName} (${staffID}) - Nominations Travelling Form`,
                text: "[Approver Level: Final Review & Approval to Head of School/ Associate Dean of Research/ Manager to Head of Management Unit/ Dean]",
                html: generateEmailHTML("[Approver Level: Final Review & Approval to Head of School/ Associate Dean of Research/ Manager to Head of Management Unit/ Dean]", formID, 1, requestData.securityKey, formDetails)
            });
        } else if (formStage === 6) {
            const recipients = ['swinburneacademicoffice@gmail.com', staffEmail];
            for (const recipient of recipients) {
                const mailOptionsCopy = { ...mailOptions };
                mailOptionsCopy.to = recipient;
                await transporter.sendMail({
                    ...mailOptionsCopy,
                    subject: `[NTF - REJECTED APPLICATION] ${staffName} (${staffID}) - Nominations Travelling Form`,
                    text: "[Applicant Level: Rejected Nomination/Traveling Form Application]",
                    html: generateEmailHTML("[Applicant Level: Rejected Nomination/Traveling Form Application]", formID, 2, requestData.revertComment)
                });
            }
        } else if (formStage === 1) {
            const mailOptionsCopy = { ...mailOptions };
            mailOptionsCopy.to = staffEmail;
            // Debugging statements,
            // console.log("Debugging reverted comment: " + requestData.revertComment);
            await transporter.sendMail({
                ...mailOptionsCopy,
                subject: `[NTF - REVERTED TO STAFF] ${staffName} (${staffID}) - Nominations Travelling Form`,
                text: "[Applicant Level - Academic Administration Office to Staff]",
                html: generateEmailHTML("[Applicant Level - Academic Administration Office to Staff]", formID, 4, requestData.revertComment, requestData.securityKey)
            });
        } else if (formStage === 5) {
            const recipients = ['swinburneacademicoffice@gmail.com', staffEmail];
            for (const recipient of recipients) {
                const mailOptionsCopy = { ...mailOptions };
                mailOptionsCopy.to = recipient;
                await transporter.sendMail({
                    ...mailOptionsCopy,
                    subject: `[NTF] ${staffName} (${staffID}) - Nominations Travelling Form`,
                    text: "[Applicant Level: Approved Nomination/Traveling Form Application]",
                    html: generateEmailHTML("[Applicant Level: Approved Nomination/Traveling Form Application]", formID, 3)
                });
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
