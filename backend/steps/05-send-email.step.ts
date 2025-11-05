import {EventConfig} from 'motia';

// step - 5:
// sends formated email with improved titles to the user using resend


export const config = {
    name: "sendEmail",
    type: "event",
    subscribes: ['yt.titles.ready'],
    emits: ['yt.email.send'],
};


interface ImprovedTitle {
    original: string;
    improved: string;
    rational: string;
    url: string;
 
}


export const handler = async (eventData: any, {emit, logger, state}: any) => {
    let jobId: string | undefined;
   try {
    const data = eventData || {};
    jobId = data.jobId;
    const email = data.email;
    const channelName = data.channelName;
    const improvedTitles = data.improvedTitles;
    logger.info("Sending email to user", {jobId, email, titleCount: improvedTitles.length});

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
  
      if (!RESEND_API_KEY) {
          throw new Error("Resend api key is not configured")
      }

      const jobData = await state.get(`job: ${jobId}`)
      await state.get(`job: ${jobId}`, {
        ...jobData,
        status: "Sending the email",
      });

      const emailText = generateEmailText(channelName, improvedTitles);

      const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
              'content-type': 'application/json',
              'authorization': `Bearer ${RESEND_API_KEY}`

          },
          body: JSON.stringify({
              from: RESEND_FROM_EMAIL,
              to: [email],
              subject: `Youtube Title Architect - Improves Titles for ${channelName}`,
              text: emailText,
          }),
      });
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Resend API error : ${errorData.error?.message} || unknown email error`);
  }
  const emailResult = await response.json()
  logger.info("Email sends successfully", {jobId, emailId: emailResult.id}); 

  await state.set(`job: ${jobId}`, {
    ...jobData,
    status: ' completed',
    emailId: emailResult.id,
    completedAt: new Date().toISOString(),
});
await emit({
    topic: 'yt.email.sent',
    data: {
        jobId,
        email,
        emailId: emailResult.id
    },
});
   } catch (error: any) {
    logger.error('Error sending emails ', {error: error.message});
    if (!jobId ) {
        logger.error("cannot send the error notification - missing jobId ")
        return ;
    }
    const jobData = await state.get(`job: ${jobId}`)
    await state.set(`job: ${jobId}`, {
        ...jobData,
        status: 'failed',
        error: error.message,
    })
    await emit({
        topic: 'yt.email.error',
        data: {
            jobId,
            
            error: "fail to send the email. please try again later",
        },
    });
}
}


function generateEmailText(
    channelName: string,
    titles: ImprovedTitle[]
): string {
    let text = `Youtube Title Architect - Improves Titles for ${channelName}\n`;
    text += `${"=".repeat(60)}\n\n`;

    titles.forEach((title, index) => {
        text += `Video ${index + 1}:\n\n`;
        text += `--------------\n`;
        text += `Original Title: ${title.original}\n`;
        text += `Improved Title: ${title.improved}\n`;
        text += `Why: ${title.rational}\n`;
        text += `Watch:: ${title.url}\n`;
        text += `--------------\n\n`;
    });

    text += `${"=".repeat(60)}\n`;
    text += `Powered by Motia.dev\n`
    return text;
}