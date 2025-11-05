import {EventConfig} from 'motia';

// step - 5:
// sends formated email with improved titles to the user using resend


export const config = {
    name: "sendEmail",
    type: "event",
    subscribes: [ 'yt.channel.error', 'yt.videos.error', 'yt.titles.error'],
    emits: ['yt.error.notified'],
};




export const handler = async (eventData: any, {emit, logger, state}: any) => {
    try {
        const data = eventData || {};
        const jobId = data.jobId;
        const email = data.email;
        const channelName = data.channelName;
        const error = data.error;
        logger.info("Sending error to user", {jobId, email,});
    
    
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
      
          if (!RESEND_API_KEY) {
              throw new Error("Resend api key is not configured")
          }
        const emailText = `we are sorry to inform you that we were not able to generate titles for the channel ${channelName} due to some issues`;
    
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'authorization': `Bearer ${RESEND_API_KEY}`
    
            },
            body: JSON.stringify({
                from: RESEND_FROM_EMAIL,
                to: [email],
                subject: `Request failes for the Youtube title Architect`,
                text: emailText,
            }),
        });
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Resend API error : ${errorData.error?.message} || unknown email error`);
    }
    const emailResult = await response.json();
    await emit({
        topic: 'yt.error.notified',
        data: {
            jobId,
            email,
            emailId: emailResult.id,
        },
    });
    } catch (error) {
        logger.error('failed to send error notification');
    }
}