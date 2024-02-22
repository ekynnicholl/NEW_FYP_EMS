import { join } from 'path';
import { readFileSync } from 'fs';

const imageToBase64 = (path: string): string => {
    try {
        const data = readFileSync(path);
        const base64 = Buffer.from(data).toString('base64');
        const mime = path.endsWith('.png') ? 'image/png' : 'image/jpeg';
        return `data:${mime};base64,${base64}`;
    } catch (error) {
        console.error('Error reading image file:', error);
        return '';
    }
};

export const GenerateCertificateParticipation = (participantName: string, eventName: string, eventDate: string, dateSubmitted: string, mainEventName: string): string => {
    const swinburneTextImagePath = join(process.cwd(), 'public/parti_cert_images/swinburne_text.png');
    const swinburneLogoImagePath = join(process.cwd(), 'public/parti_cert_images/swinburne_logo.png');

    const swinburneTextBase64 = imageToBase64(swinburneTextImagePath);
    const swinburneLogoBase64 = imageToBase64(swinburneLogoImagePath);

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

    return `
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        margin: 0;
                        font-family: Arial, sans-serif;
                        background-color: #f0f0f0 !important;
                        color: white;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                        background: radial-gradient(circle, #d90000, #860202);
                    }

                    #top {
                        background-color: black !important;
                        padding: 10px;
                        flex: 1;
                        border-bottom-left-radius: 40px;
                        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between; 
                        font-weight: bold;
                    }

                    #bottom {
                        flex: 2;
                        display: flex;
                        flex-direction: column;
                        justify-content: center; 
                        align-items: center;
                        font-weight: bold;
                    }
                    
                    #footer {
                        margin-top: auto; /* Push the footer to the bottom */
                        color: black !important;
                        font-size: 14px;
                        font-weight: 600;
                    }
                    
                    #swinburneLogo {
                        position: absolute;
                        top: 0;
                        right: 0;
                        width: 100px;
                        height: auto;
                    }

                    .top-text {
                        align-self: flex-start;
                        margin-left: 32px;
                        margin-top: 0;
                    }
                    
                    #signed {
                        align-self: flex-end;
                    }
                    
                    #signed-content {
                        margin: 0 auto;
                        padding-right: 20px;
                    }
                    
                    #additionalLogo {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        width: 100px;
                        height: auto;
                    }
                    
                    #divider {
                        width: 100%;
                        border-top: 1px solid white;
                    }
                </style>
            </head>
            <body>
                <div id="top">
                    <img id="swinburneLogo" src="${swinburneTextBase64}" alt="Swinburne Text">
                    <h1 class="top-text" style="font-size: 40px;">Certificate of Attendance</h1>
                    <div class="top-text" style="font-size: 40px; padding: 0; margin-bottom: -20px;">
                        <p>${participantName}</p>
                    </div>
                </div>
                <div id="bottom" style="font-size: 40px;">
                    <div>
                    <p style="margin-bottom: 100px; padding-left: 10px; padding-right: 10px;">${mainEventName} - ${eventName}</p>
                        <p style="margin: 0;">on</p>
                        <p style="margin: 0; padding-top: 15px;">${eventDate}</p>
                    </div>
                </div>
                <div id="signed">
                    <div id="signed-content">
                        <p style="margin-bottom: 5px;">${formattedDate(dateSubmitted)}</p>
                        <div id="divider"></div>
                        <p>Date Awarded</p>
                    </div>
                </div>
                <div id="footer">
                    <p style="">Learning and Teaching Unit, Swinburne University of Technology Sarawak Campus</p>
                </div>
                <img id="additionalLogo" src="${swinburneLogoBase64}" alt="Swinburne Logo">
            </body>
        </html>
    `;
};