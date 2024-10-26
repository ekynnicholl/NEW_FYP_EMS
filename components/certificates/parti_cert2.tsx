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

export const GenerateCertificateParticipation = (participantName: string, eventName: string, dateSubmitted: string, mainEventName: string, atVenue: string, showSubName: boolean): string => {
    const formattedDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
        const year = date.getFullYear().toString();
        return `${day}/${month}/${year}`;
    };

    const swinburneTextImagePath = join(process.cwd(), 'public/parti_cert_images/swinburne_logo1.png');
    const swinburneLogoImagePath = join(process.cwd(), 'public/parti_cert_images/swinburne_logo.png');

    const swinburneTextBase64 = imageToBase64(swinburneTextImagePath);
    const swinburneLogoBase64 = imageToBase64(swinburneLogoImagePath);

    let eventNameDisplay;
    if (showSubName) {
        eventNameDisplay = `${mainEventName} - ${eventName}`;
    } else {
        eventNameDisplay = mainEventName;
    }

    return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Red Border Page</title>
                <style>

                @font-face {
                    font-family: SimplonNorm;
                    src: url(public/parti_cert_images/SimplonNorm-Regular.ttf) format('truetype');
                }

                @font-face {
                    font-family: SimplonNormBold;
                    src: url(public/parti_cert_images/SimplonNorm-Bold.ttf) format('truetype');
                }

                @font-face {
                    font-family: SimplonNormItalic;
                    src: url(public/parti_cert_images/SimplonNorm-Light.ttf) format('truetype');
                }

                body {
                    margin: 0;
                    padding: 0;
                    font-family: SimplonNorm;
                }
            
                .border {
                    margin-top: 75px;
                    margin-left: 75px;
                    border-top: 7px solid red;
                    border-left: 7px solid red;
                    padding: 20px;
                    height: 735px;
                    margin-right: 100px;
                }

                .absolute-shape {
                    position: absolute;
                    right: 96px;
                    top: 73px;
                    border: 7px solid white;
                    width: 20px;
                    height: 0.2px;
                    clip-path: polygon(100% 0, 0% 100%, 100% 100%);
                }

                .sec-absolute-shape {
                    position: absolute;
                    left: 58px;
                    bottom: 199px;
                    border: 7px solid white;
                    width: 14px;
                    height: 0.1px;
                    clip-path: polygon(90% 0%, 60% 100%, 90% 100%);
                }
            
                .content {
                    display: flex;
                    justify-content: space-between;
                }
            
                .left-div {
                    margin-left: 30px;
                    width: 10%;
                    transform: rotate(90deg);
                    transform-origin: top top;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    white-space: nowrap;
                    margin-top: 30px;
                }

                .title-font {
                    font-family: SimplonNormItalic;
                }
                
                .title-content-font {
                    font-family: SimplonNorm;
                }

                .bold-simplon {
                    font-family: SimplonNormBold;
                }
            
                .left-div .side-text {
                    color: #c1c1c1;
                    font-size: 46px;
                    font-weight: 46px;
                    letter-spacing: -2px;
                    font-family: SimplonNormBold;
                }
            
                .middle-div {
                    margin-left: 50px;
                    width: 50%;
                    padding: 10px;
                }
            
                .middle-div h2 {
                    margin: 0 0 80px 0;
                    /* Add margin top and bottom */
                }
            
                .middle-div p {
                    padding: 0;
                    margin: 0;
                }
            
                .right-div {
                    width: 30%;
                    padding: 10px;
                }
            
                .right-div img {
                    max-width: 100%;
                    margin-top: 480px;
                    opacity: 0.1;
                    margin-left: -7.5px;
                }
            
                .absolute-logo {
                    position: absolute;
                    bottom: 25px;
                    right: 50px;
                }
                </style>
            </head>
            <body>
                <div class="border">
                <div class="absolute-shape"></div>  
                <div class="sec-absolute-shape"></div>              
                <div class="content">
                    <div class="left-div">
                    <div class="side-text">CERTIFICATE OF ATTENDANCE</div>
                    </div>
                    <div class="middle-div">
                    <p class="title-font" style="margin-top: 30px; margin-bottom: 50px;">Presented to</p>
                    <h2 class="title-content-font">${participantName}</h2>
                    <p class="title-font">attended the</p>
                    <h2 class="title-content-font">${eventNameDisplay}</h2>
                    <p class="title-font">which was held at</p>
                    <h2 class="title-content-font">${atVenue}</h2>
                    <p class="title-font">on this date</p>
                    <h2 class="title-content-font">${formattedDate(dateSubmitted)}</h2>
                    <p class="title-font" style="margin-top: 80px;">This is a computer generated certificate and requires no signature.</p>
                    </div>
                    <div class="right-div">
                    <img src="${swinburneLogoBase64}" alt="Logo Image">
                    </div>
                </div>
                </div>
                <img src="${swinburneTextBase64}" alt="Second Logo" class="absolute-logo">
            </body>
        </html>
    `;
};