import {ApiRouteConfig} from 'motia';

// step -1:
// Accept channel name and email and to start the workflow
export const config: ApiRouteConfig = {
    name: "submitChannel",
    type: "api",
    path: "/submit",
    method: "POST",
    emits: ['yt.submit'],
};
interface SubmitRequest {
    channel: string,
    email: string
}


export const handler = async (req: any, {emit, logger, state}: any) => {
    try {
        logger.info('Recieved submission request', {body: req.body})

        const {channel, email} = req.body as SubmitRequest;
        if (!channel || !email) {
            return {
                status: 400,
                body: {
                    error: "Missing require fiels, plese provide channel name and email",
                }
            }
        }
        
        

        // validate
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            return {
                status: 400,
                body: {
                    error: "Invalid email format",
                }
            }
        }

        const jobId = `jobId-${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;  
        await state.set(`job: ${jobId}`, {
            jobId,
            channel,
            email,
            status: "queued",
            createdAt: new Date().toISOString()
        })
        logger.info('job created', {jobId, channel, email})

        await emit({
            topic: "yt.submit",
            data: {
                jobId,
                channel,
                email
            }
        });
        return {
            status: 202,
            body: {
                success: true,
                jobId,
                message: "your request has been queued. you wil get an email soon with improved suggestions for your youtube channel"
            },
        }
}
     catch (error: any) {
       logger.error('error in submission handler', {error: error.message});
       return {
        status: 500,
        body: {
            error: "Internal server error",
        }
       }
    }
}