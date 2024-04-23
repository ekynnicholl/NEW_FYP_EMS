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
    const linkforAAO = `${url}/external/${formID}`;

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
        } else {
            securityKeySentence = 'Security key not found. Please refer to user manual for more assistance (ERRR_T1).'

            securityKey = securityKeySentence;
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
                    <p class="no-p-m">The status of this form: <span style="font-weight: bold;"> ${optionalFields2}</span>, is still pending for your first review and approval, and an Academic Administration Officer has triggered a manual email reminder to you. Please click the link below for your next action.</p>
                    <br/>
                    ${securityKeySentence}
                    ${securityKey}
                    <br/>
                    <p class="no-p-m">Should the action above have been resolved, please note that you will no longer receive any reminders. Please email to ${optionalFields3} if you encounter any issues with the link above.</p>
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
    }






    // Reminder to AAO,
    else if (type == 2) {
        let aaoLink = `
        
        `

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
                    <p class="no-p-m">The status of this form: <span style="font-weight: bold;"> ${optionalFields}</span>, is still pending for your first review and approval, and the applicant has triggered a manual email reminder to you (3 days from last update). Please click the link below for your next action.</p>
                    <br/>
                    <p class="no-p-m">Link: ${linkforAAO} </p>
                    <br/>
                    <p class="no-p-m">Should the action above have been resolved, please note that you will no longer receive any reminders. Please email to fypemsmaster369@gmail.com if you encounter any issues with the link above.</p>
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
        const aaoEmail = requestData.aao_email;

        if (formStage == 3) {
            reminderEmail = requestData.verification_email;
        } else if (formStage == 4) {
            reminderEmail = requestData.approval_email;
        } else if (formStage == 2) {
            reminderEmail = 'swinburneacademicoffice@gmail.com'
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

        if (formStage == 2) {
            await transporter.sendMail({
                ...mailOptionsCopy,
                subject: `[NTF - ATTENTION NEEDED] ${staffName} (${staffID}) - Nominations Travelling Form`,
                text: "[Reminder Email]",
                html: generateEmailHTML("[Reminder Email]", formID, 2, formDetails)
            });
        } else {
            await transporter.sendMail({
                ...mailOptionsCopy,
                subject: `[NTF - ATTENTION NEEDED] ${staffName} (${staffID}) - Nominations Travelling Form`,
                text: "[Reminder Email]",
                html: generateEmailHTML("[Reminder Email]", formID, 1, securityKey, formDetails, aaoEmail)
            });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
