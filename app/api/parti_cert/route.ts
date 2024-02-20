import { NextResponse } from "next/server";
import { mailOptions, transporter } from '@/config/nodemailer'

const url = process.env.NEXT_PUBLIC_WEBSITE_URL;

// To handle a GET request to /ap
export async function GET(request: Request) {
    return NextResponse.json({ request }, { status: 200 });
}

const formattedDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZoneName: 'short',
    };

    return date.toLocaleString('en-US', options);
};

export async function POST(request: Request) {
    try {
        const requestData = await request.json();

        // console.log('Received request data:', requestData);

        const atEmail = requestData.attFormsStaffEmail;
        const atEventName = requestData.eventName;
        const atEventVenue = requestData.eventVenue;
        const atEventStartDate = requestData.eventStartDate;
        const atDateSubmitted = formattedDate(requestData.attDateSubmitted);

        const mailContent = `
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
                    <p class="no-p-m">This email serves to inform you that you have successfully participated in following event, </p>
                    <br/>
                    <p class="no-p-m">Event Name: ${atEventName}</p>
                    <p class="no-p-m">Venue: ${atEventVenue}</p>
                    <p class="no-p-m">Date: ${atEventStartDate}</p>
                    <p class="no-p-m">Time of Submission: ${atDateSubmitted}</p>
                    <br/>
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
                    Process: [Certificate of Participation]
                    </p>
                </div>
            </body>
        </html>
        `;

        const mailOptionsCopy = { ...mailOptions };
        mailOptionsCopy.to = atEmail;

        if (!mailOptions.to) {
            throw new Error('Recipient email address not specified.');
        }

        await transporter.sendMail({
            ...mailOptionsCopy,
            subject: "Certificate of Participation",
            text: mailContent,
            html: mailContent
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: (error as any).message }, { status: 500 });
    }
}

