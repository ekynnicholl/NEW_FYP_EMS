export const GenerateCertificateParticipation = (participantName: string, eventName: string, dateSubmitted: string, mainEventName: string, atVenue: string): string => {
    const formattedDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
        const year = date.getFullYear().toString();
        return `${day}/${month}/${year}`;
    };

    return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Red Border Page</title>
                <style>

                @font-face {
                    font-family: Schar;
                    src: url(Schar-Regular-BF64c32408d2c12.otf);
                }

                body {
                    margin: 0;
                    padding: 0;
                    font-family: Schar;
                }
            
                .border {
                    margin-top: 35px;
                    /* Move the border 5px away from the top margin */
                    margin-left: 35px;
                    /* Move the border 5px away from the left margin */
                    border-top: 7px solid red;
                    border-left: 7px solid red;
                    padding: 20px;
                    height: 750px;
                    margin-right: 100px;
                }
            
                .content {
                    display: flex;
                    justify-content: space-between;
                }
            
                .left-div {
                    margin-left: 30px;
                    width: 10%;
                    transform: rotate(90deg);
                    /* Rotate the div 90 degrees counter-clockwise */
                    transform-origin: top top;
                    /* Set the origin point for rotation */
                    height: 100%;
                    display: flex;
                    align-items: center;
                    white-space: nowrap;
                    margin-top: 50px;
                }
            
                .left-div h1 {
                    color: #c1c1c1;
                    font-size: 36px;
                    opacity: 0.5;
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
                    max-width: 170%;
                    /* Ensure the image does not exceed the container width */
                    margin-top: 480px;
                    margin-left: -37.5px;
                    opacity: 0.1;
                }
            
                .absolute-logo {
                    position: absolute;
                    bottom: 25px;
                    right: 25px;
                }
                </style>
            </head>
            <body>
                <div class="border">
                <div class="content">
                    <div class="left-div">
                    <h1>CERTIFICATE OF ATTENDANCE</h1>
                    </div>
                    <div class="middle-div">
                    <p style="margin-top: 50px; margin-bottom: 80px;">Presented to</p>
                    <h2>${participantName}</h2>
                    <p>attended the</p>
                    <h2>${mainEventName} - ${eventName}</h2>
                    <p>which was held at</p>
                    <h2>${atVenue}</h2>
                    <p>on ${formattedDate(dateSubmitted)}</p>
                    <p style="margin-top: 160px;">This is a computer generated certificate
                    and requires no signature.</p>
                    </div>
                    <div class="right-div">
                    <img src="https://cdn.freebiesupply.com/logos/large/2x/swinburne-university-of-technology-3-logo-png-transparent.png" alt="Logo Image">
                    </div>
                </div>
                </div>
                <img src="https://seeklogo.com/images/S/swinburne-university-of-technology-logo-8DF0E18721-seeklogo.com.png" alt="Second Logo" class="absolute-logo">
            </body>
        </html>
    `;
};