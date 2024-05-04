import { NextResponse } from "next/server";
import { mailOptions, transporter } from "@/config/nodemailer";

const url = process.env.NEXT_PUBLIC_WEBSITE_URL;

// To handle a GET request to /ap
export async function GET(request: Request) {
    return NextResponse.json({ request }, { status: 200 });
}

// const formattedDate = (dateString: string) => {
//     const date = new Date(dateString);
//     const options: Intl.DateTimeFormatOptions = {
//         hour: "numeric",
//         minute: "numeric",
//         second: "numeric",
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         timeZoneName: "short",
//     };

//     return date.toLocaleString("en-US", options);
// };

const formattedDate = (dateString: string) => {
    // Convert input string to a Date object
    const date = new Date(dateString);

    // Add 4 hours to the date object
    date.setHours(date.getHours() + 4);

    // Specify the formatting options
    const options: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZoneName: "short",
    };

    // Return the formatted date string with added 4 hours
    return date.toLocaleString("en-US", options);
};

export async function POST(request: Request) {
    try {
        const requestData = await request.json();

        // console.log('Received request data:', requestData);

        const atID = requestData[0].atID;
        const atIdentifier = requestData[0].atIdentifier;
        const atAccessToken = requestData[0].atAccessToken;
        const atCreatedAt = requestData[0].atCreatedAt;

        const tempLink = `${url}/attended_events?tokenid=${atID}&ptoken=${atAccessToken}`;

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
                    
                    <h2 class="no-p-m">Dear Sir/ Ms/ Mdm,</h2>
                    <br/>
                    <p class="no-p-m">You have requested for an <span style="font-weight: bold;">Access Token</span> to view the status of your current and past <span style="font-weight: bold;">Nominations/ Traverlling Forms application</span> or the summary of your 
                    Attendance record for past events. Please visit the link below:</p>
                    <br/>
                    <span style="font-weight: bold;">Link: </span><a href="${tempLink}" style="color: #0070f3; text-decoration: underline;" class="no-p-m">${tempLink}</a>
                    <br/>
                    <br/>
                    <p class="no-p-m" style="font-weight: bold;">Please take note that you may enter the following Access Token manually.</p>
                    <p class="no-p-m">Access Token: ${atAccessToken}</p>
                    <br/>
                    <p class="no-p-m">The access token has a lifespan of 4 hours, which means that you will need to request a new access token from the date or time of request after it has expired.
                    Please note that it is expiring in 4 hours by ${formattedDate(atCreatedAt)}.</p>
                    <br/>
                    <p class="no-p-m">Did not request for an access token? Please ignore this email.</p>
                    <br/>
                    <p class="no-p-m">Thank you for using our system. We're committed to ensuring your user experience is as seamless and hassle free as possible.</p>
                    <br/>
                    <p class="no-p-m">Regards, <br/> Event Management and Attendance Tracking (EMAT) Developer Team</p>\
                </div>
            </body>
        </html>
        `;

        const mailOptionsCopy = { ...mailOptions };
        mailOptionsCopy.to = atIdentifier;

        if (!mailOptions.to) {
            throw new Error("Recipient email address not specified.");
        }

        await transporter.sendMail({
            ...mailOptionsCopy,
            subject: "[Access Token] Nominations/ Travelling Forms Status & Staff Attendance Summary",
            text: mailContent,
            html: mailContent,
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: (error as any).message }, { status: 500 });
    }
}
