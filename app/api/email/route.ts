import { NextResponse } from "next/server";
import { mailOptions, transporter } from '@/config/nodemailer'

// To handle a GET request to /ap
export async function GET(request: Request) {
    return NextResponse.json({ request }, { status: 200 });
}

// type 1: approval/ rejection, type 2: rejection, type 3: approved, type 4: reverted email to staff, type 5: form has been received
function generateEmailHTML(process: string, formID: string, type: number, optionalFields?: string, optionalFields2?: string) {
    const link = `http://localhost:3000/external_testing_edit/${formID}`;
    if (type == 1) {
        let securityKeySentence = '';

        if (optionalFields && optionalFields.trim() !== '') {
            securityKeySentence = `
                <p><span style="font-weight: bold;">[IMPORTANT!]</span> This is the security key you MUST input into the form for you to approve/ reject: <br/><span style="font-weight: bold;">${optionalFields}</span></p>
                <p>Please take note that this key is sent to you and to you only and will be destroyed immediately after use.</p>
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
                </style>
            </head>
            <body>
                <div class="email-container">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png" alt="Image Description" height="150px" width="300px">
                    <h2 class="no-p-m">Dear sir/ ma'am,</h2>
                    <br/>
                    <p class="no-p-m">There is currently a <span style="font-weight: bold;">Nominations/ Travelling Form (NTF)</span> pending for approval/ rejection by you. Please visit the link below to take action: </p>
                    <p class="no-p-m">${link}</p>
                    <br/>
                    ${securityKeySentence}
                    <p class="no-p-m">Thank you for using our system.</p>
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
                    Process: ${process}
                    </p>
                </div>
            </body>
        </html>
        `;
    } else if (type == 2) {
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
                    <br/>
                    <p class="no-p-m">We regret to inform you that your Nominations/ Travelling Form has been rejected. You may review the PDF version of it here: </p>
                    <p class="no-p-m">${link}</p>
                    <br/>
                    <p class="no-p-m">Thank you for using our system.</p>
                    <br/>
                    <p class="no-p-m">Regards, <br/> Event Management and Attendance Tracking (EMAT) Developer Team</p>
                    <br/>
                    <p style="color: red; text-align: justify;">[NOTICE] <br/>
                    This e-mail and any attachments are confidential and intended only for the use of the addressee. They may contain information that is privileged or protected by copyright. 
                    If you are not the intended recipient, any dissemination, distribution, printing, copying or use is strictly prohibited. 
                    The University does not warrant that this e-mail and any attachments are secure and there is also a risk that it may be corrupted in transmission. 
                    It is your responsibility to check any attachments for viruses or defects before opening them. If you have received this transmission in error, please contact us on 
                    +6082 255000 and delete it immediately from your system. We do not accept liability in connection with computer virus, data corruption, delay, interruption, 
                    unauthorised access or unauthorised amendment. <br/>
                    Process: ${process}
                    </p>
                </div>
            </body>
        </html>
        `;
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
                </style>
            </head>
            <body>
                <div class="email-container">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png" alt="Image Description" height="150px" width="300px">
                    
                    <h2 class="no-p-m">Dear sir/ ma'am,</h2>
                    <p class="no-p-m">Congratulations! Your Nominations/ Travelling Form has been approved! You may view the PDF version of it here:</p>
                    <p class="no-p-m">${link}</p>
                    <br/>
                    <p class="no-p-m">Thank you for using our system.</p>
                    <br/>
                    <p class="no-p-m">Regards, <br/> Event Management and Attendance Tracking (EMAT) Developer Team</p>
                    <br/>
                    <p style="color: red; text-align: justify;">[NOTICE] <br/>
                    This e-mail and any attachments are confidential and intended only for the use of the addressee. They may contain information that is privileged or protected by copyright. 
                    If you are not the intended recipient, any dissemination, distribution, printing, copying or use is strictly prohibited. 
                    The University does not warrant that this e-mail and any attachments are secure and there is also a risk that it may be corrupted in transmission. 
                    It is your responsibility to check any attachments for viruses or defects before opening them. If you have received this transmission in error, please contact us on 
                    +6082 255000 and delete it immediately from your system. We do not accept liability in connection with computer virus, data corruption, delay, interruption, 
                    unauthorised access or unauthorised amendment. <br/>
                    Process: ${process}
                    </p>
                </div>
            </body>
        </html>
        `;
    }
    else if (type = 4) {
        let securityKeySentence = '';

        if (optionalFields2 && optionalFields2.trim() !== '') {
            securityKeySentence = `
                <p><span style="font-weight: bold;">[IMPORTANT!]</span> This is the security key you MUST input into the form for you to re-submit your form: <br/><span style="font-weight: bold;">${optionalFields2}</span></p>
                <p>Please take note that this key is sent to you and to you only and will be destroyed immediately after use.</p>
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
                    <p class="no-p-m">Your form has been reverted for further changes. Please refer to the link below to make changes: </p>
                    <p class="no-p-m">${link}</p>
                    <br/>
                    <p class="no-p-m" style="font-weight:bold;"> Reason(s) of reverting: </p>
                    <p class="no-p-m" style="font-weight:bold;">${optionalFields}</p>
                    <br/>
                    ${securityKeySentence}
                    <p class="no-p-m">Thank you for using our system.</p>
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
                    Process: ${process}
                    </p>
                </div>
            </body>
        </html>
        `;
    }
    else if (type = 5) {
        return `
        <html>
            <head>
                <style>
                    .email-container {
                        padding: 20px;
                        max-width: 1400px; 
                        margin: 0 auto;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Swinburne_University_of_Technology.svg/1200px-Logo_of_Swinburne_University_of_Technology.svg.png" alt="Image Description" height="150px" width="300px">
                    
                    <h2>Dear sir/ ma'am,</h2>
                    <p>This email serves to inform you that your Nominations/ Travelling Form has been received at our end. You will only be updated if there are any changes required to be made,
                    approved or rejected. If you have any questions, please do not hesitate to contact us at ...@...</p>
                    <br/>
                    <br/>
                    <p>Thank you for using our system.</p>
                    <p>Regards, <br/> Event Management and Attendance Tracking (EMAT) Developer Team</p>
                    <br/>
                    <p style="color: red; text-align: justify;">[NOTICE] <br/>
                    This e-mail and any attachments are confidential and intended only for the use of the addressee. They may contain information that is privileged or protected by copyright. 
                    If you are not the intended recipient, any dissemination, distribution, printing, copying or use is strictly prohibited. 
                    The University does not warrant that this e-mail and any attachments are secure and there is also a risk that it may be corrupted in transmission. 
                    It is your responsibility to check any attachments for viruses or defects before opening them. If you have received this transmission in error, please contact us on 
                    +6082 255000 and delete it immediately from your system. We do not accept liability in connection with computer virus, data corruption, delay, interruption, 
                    unauthorised access or unauthorised amendment. <br/>
                    Process: ${process}
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
                    <p>ERROR. Please contact the server administrator! </p>
                </div>
            </body>
        </html>
        `;
    }
}

export async function POST(request: Request) {
    try {
        const requestData = await request.json();

        const formStage = requestData.formStage;
        const formID = requestData.formID;

        // console.log('Received request data:', requestData);

        if (formStage === 2) {
            await transporter.sendMail({
                ...mailOptions,
                subject: "[NTF] Nominations Travelling Form",
                text: "Staff to AAO",
                html: generateEmailHTML("[Staff to Academic Administration Office]", formID, 1)
            });
        } else if (formStage === 3) {
            const mailOptionsCopy = { ...mailOptions };
            mailOptionsCopy.to = requestData.hosEmail;
            await transporter.sendMail({
                ...mailOptionsCopy,
                subject: "[NTF] Nominations Travelling Form",
                text: "AAO to Head of School",
                html: generateEmailHTML("[Academic Administration Office to Head of School/ Associate Dean of Research/ Manager]", formID, 1, requestData.securityKey)
            });
        } else if (formStage === 6) {
            const recipients = ['fypemsmaster369@gmail.com', 'jadpichoo@outlook.com'];
            for (const recipient of recipients) {
                const mailOptionsCopy = { ...mailOptions };
                mailOptionsCopy.to = recipient;
                await transporter.sendMail({
                    ...mailOptionsCopy,
                    subject: "[NTF] Nominations Travelling Form",
                    text: "NTF Reject",
                    html: generateEmailHTML("[Rejection Email]", formID, 2)
                });
            }
        } else if (formStage === 1) {
            await transporter.sendMail({
                ...mailOptions,
                subject: "[NTF] Nominations Travelling Form",
                text: "AAO to Staff",
                html: generateEmailHTML("[Academic Administration Office to Staff]", formID, 4, requestData.revertComment, requestData.securityKey)
            });
        } else if (formStage === 5) {
            const recipients = ['fypemsmaster369@gmail.com', 'jadpichoo@outlook.com'];
            for (const recipient of recipients) {
                const mailOptionsCopy = { ...mailOptions };
                mailOptionsCopy.to = recipient;
                await transporter.sendMail({
                    ...mailOptionsCopy,
                    subject: "[NTF] Nominations Travelling Form",
                    text: "AAO to Staff",
                    html: generateEmailHTML("[Accepted Email]", formID, 3)
                });
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

