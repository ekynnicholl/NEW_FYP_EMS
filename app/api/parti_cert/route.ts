import { NextResponse } from "next/server";
import { mailOptions, transporter } from '@/config/nodemailer'
import puppeteer from 'puppeteer';
import { GenerateCertificateParticipation } from "@/components/certificates/parti_cert2";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { v4 as uuidv4 } from 'uuid';

const generatePdfFromHtml = async (html: string): Promise<Buffer> => {
    const browser = await puppeteer.launch({
        headless: true,
        devtools: false
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ printBackground: true });
    await browser.close();
    return pdfBuffer;
};

// To handle a GET request to /ap
export async function GET(request: Request) {
    return NextResponse.json({ request }, { status: 200 });
}

export async function POST(request: Request) {
    try {
        const requestDataArray = await request.json();
        const supabase = createClientComponentClient();

        console.log('Received request data in route:', requestDataArray);

        for (const requestData of requestDataArray) {
            const atEmail = requestData.attFormsStaffEmail;
            const atEventName = requestData.eventName;
            const atSubEventName = requestData.sub_eventName;
            const atStaffID = requestData.attFormsStaffID;
            const atDateSubmitted = requestData.attDateSubmitted;
            const atStaffName = requestData.attFormsStaffName;
            const atFormsID = requestData.attFormsID;
            const atVenue = requestData.sub_eventVenue;

            const certificateContent = GenerateCertificateParticipation(atStaffName, atSubEventName, atDateSubmitted, atEventName, atVenue);

            const pdfBuffer = await generatePdfFromHtml(certificateContent);

            let documentPath: string | undefined = "";
            const uniqueName = uuidv4();

            // Use the pdfBuffer directly for uploading to Supabase storage
            const { data: storageData, error: storageError } = await supabase
                .storage
                .from('attFormsCertofParticipation')
                .upload(`${atStaffName}_Certificate of Attendance_${uniqueName}.pdf`, pdfBuffer, {
                    cacheControl: '3600',
                    upsert: false,
                });

            documentPath = storageData?.path;

            if (storageError) {
                throw new Error('Error uploading the document to Supabase storage.');
            }

            const { data, error } = await supabase
                .from('attendance_forms')
                .update({ attFormsCertofParticipation: documentPath })
                .eq('attFormsID', atFormsID);

            if (error) {
                throw new Error('Error updating the path for this attendance form.');
            }

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
                        <p class="no-p-m">Thank you for attendance ${atEventName}! We hope you found the event to be informative and enjoyable. </p>
                        <br/>
                        <p class="no-p-m">Attached is a copy of your Certificate of Attendance.</p>
                        <br/>
                        <p class="no-p-m">Thank you for using our system. We're committed to ensuring your user experience is as seamless and hassle free as possible.</p>
                        <br/>
                        <p class="no-p-m">Regards, <br/> Event Management and Attendance Tracking (EMAT) Developer Team</p>
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

            const pdfFilename = `${atStaffName} (${atStaffID}) - Certificate of Attendance.pdf`;

            await transporter.sendMail({
                ...mailOptionsCopy,
                subject: "Confirmation of Participation",
                text: "Please enable HTML in your email client to view this message.",
                html: mailContent,
                attachments: [
                    {
                        filename: pdfFilename,
                        content: pdfBuffer,
                    },
                ],
            });
        };

        return NextResponse.json({ success: true, message: "Certificates generated and sent successfully." }, { status: 200 });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: (error as any).message }, { status: 500 });
    }
}

