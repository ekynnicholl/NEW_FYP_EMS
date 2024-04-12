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

    if (type == 1) {
        let securityKeySentence = "";
        let securityKey = "";

        if (optionalFields && optionalFields.trim() !== "") {
            securityKeySentence = `
                <p><span style="font-weight: bold;">[IMPORTANT!]</span> The link contains a security key, please <span style="font-weight: bold;">DO NOT CHANGE</span> the link: <br/><a href="${link}/?secKey=${optionalFields}" style="color: #0070f3; text-decoration: underline;" class="no-p-m"><span style="font-weight: bold;">${link}/?secKey=${optionalFields}</span></a></p>
                <p>Please take note that this key is sent to you and to you only and will be destroyed immediately after use.</p>
            `;

            securityKey = `
                <p class="no-p-m" style="font-weight: bold;">Security Key: ${optionalFields} </p>
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
                </style>
            </head>
            <body>
                <div class="email-container">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png" alt="Image Description" height="150px" width="300px">
                    
                    <h2 class="no-p-m">Dear sir/ ma'am,</h2>
                    <p class="no-p-m">The status of this form: <span style="font-weight: bold;"> ${optionalFields2} </span>, have not been updated for more than a day and an Academic Administration Officer has triggered a manual reminder to you. Please visit the link below to take action. </p>
                    ${securityKeySentence}
                    ${securityKey}
                    <br/>
                    <p class="no-p-m" style="font-weight:bold;"> If you are no longer interested in this forms, please email to our office at ..@.. so you will no longer receive any more reminders.</p>
                    <br/>
                    <p class="no-p-m">Thank you for using our system.</p>
                    Process: ${process}
                    <br/>
                    <br/>
                    <p class="no-p-m">Regards, <br/> Event Management and Attendance Tracking (EMAT) Developer Team</p>
                    <br/>
                    <p class="no-p-m" style="color: red; text-align: justify;">[NOTICE] <br/>
                    This e-mail and any attachments are confidential and intended only for the use of the addressee. They may contain information that is privileged or protected by copyright. 
                    If you are not the intended recipient, any dissemination, distribution, printing, copying or use is strictly prohibited. 
                    The University does not warrant that this e-mail and any attachments are secure and there is also a risk that it may be corrupted in transmission. 
                    It is your responsibility to check any attachments for viruses or defects before opening them. If you have received this transmission in error, please contact us on 
                    +6082 255000 and delete it immediately from your system. We do not accept liability in connection with computer virus, data corruption, delay, interruption, 
                    unauthorised access or unauthorised amendment. <br/>
                    </p>
                </div>
            </body>
        </html>
        `;
    }
}

export async function POST(request: Request) {
    try {
        const tempData = await request.json();
        const requestData = tempData;

        // console.log(requestData);

        const formID = requestData.id;
        let reminderEmail = requestData.email;
        const formStage = requestData.formStage;

        if (formStage == 3) {
            reminderEmail = requestData.verification_email;
        } else if (formStage == 4) {
            reminderEmail = requestData.approval_email;
        } else {
            reminderEmail = requestData.email;
        }

        const formDetails = requestData.full_name + " (" + requestData.staff_id + ") - " + requestData.program_title;
        const staffName = requestData.full_name;
        const staffID = requestData.staff_id;
        const securityKey = requestData.securityKey;

        // Debugging statements,
        // console.log("Debugging Form Stage: " + formStage);

        const mailOptionsCopy = { ...mailOptions };
        mailOptionsCopy.to = reminderEmail;

        await transporter.sendMail({
            ...mailOptionsCopy,
            subject: `[NTF - ATTENTION NEEDED] ${staffName} (${staffID}) - Nominations Travelling Form`,
            text: "[Reminder Email]",
            html: generateEmailHTML("[Reminder Email]", formID, 1, securityKey, formDetails)
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
