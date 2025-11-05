import {EventConfig} from 'motia';

// step - 4:
// uses openAI GPT-4 to generate imoroved titles


export const config = {
    name: "GenerateTitles",
    type: "event",
    subscribes: ['yt.videos.fetched'],
    emits: ['yt.titles.ready', 'yt.titles.error'],
};

interface Video {
    videoId: string;
    title: string;
    url: string;
    publishedAt: string;
    thumbnail: string;
    
}

interface ImprovedTitle {
    original: string;
    improved: string;
    rational: string;
    url: string;
 
}


export const handler = async (eventData: any, {emit, logger, state}: any) => {
    let jobId: string | undefined;
    let email: string | undefined;
    try {
        const data = eventData || {} 
        jobId = data.jobId;
        email = data.email;
      const channelName = data.channelName;
      const videos = data.videos;
      logger.info("Resolving youtube channel", {jobId, videoCount: videos.length})
  
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  
      if (!OPENAI_API_KEY) {
          throw new Error("openAI api key is not configured")
      }
      const jobData = await state.get(`job: ${jobId}`)
      await state.get(`job: ${jobId}`, {
        ...jobData,
        status: "generating titles",
      });

      const videoTitles = videos.map((v: Video, idx: number) => `${idx + 1}. "${v.title}"`).join('\n')

     const prompt = `You are a Youtube title optimization expert. Below are ${videos.length}
     video titles from the channel "${channelName}".
     For each title, provide : 
     1. An improved version that is more engaging,
     SEO-friendly, and likely to get more clicks 
     2. A brief rational (1-2 sentences) explaining why the improved title is better
     
     Guidelines: 
     - keep the core topic and authenticity
     -Use action verbs , numbers, and specific value propositions
     
     - Make it curiousity- including without being clickbait
     - Optimize for searchability and clarity
     
     Video titles:
     ${videoTitles}
     
     Respond in JSON format: 
     {
     "titles": [
         {
             "original": "...",
             "improved": "...",
             "rational": "...",
             "url": "video url"
         }
     ]
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: "POST",
        headers: {
            'content-type': "application/json",
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages : [
                {
                    role: 'system',
                    content: "You are a youtube SEO and engagement expert who helps creators to write better video titles",
                },
                {
                    role: 'user',
                    content: prompt
                }

            ],
            temperature: 0.7,
            response_format: {type: 'json_object'}
        })
      })
      if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`OpenAI API error : ${errorData.error?.message} || unknown AI error`);
            
      }

      const aiResponse = await response.json()
      const aiContent = aiResponse.choices[0].message.content;
      const parsedResponse = JSON.parse(aiContent)

      const improvedTitles: ImprovedTitle[] = parsedResponse.titles.map((title: any, idx: number) => ({
        original: title.original,
        improved: title.improved,
        rational: title.rational,
        url: videos[idx].url
      }))
      logger.info('titles generated successfuly', {jobId,
        count: improvedTitles.length
      })

      await state.set(`job: ${jobId}`, {
        ...jobData,
        status: 'titles are ready',
        improvedTitles
    })
    await emit({
        topic: 'yt.titles.ready',
        data: {
            jobId,
            channelName,
            improvedTitles,
            email,
        },
    });

    }catch (error: any) {
        logger.error('Error generating titles ', {error: error.message});
        if (!jobId || !email) {
            logger.error("cannot send the error notification - missing jobId or email")
            return ;
        }
        const jobData = await state.get(`job: ${jobId}`)
        await state.set(`job: ${jobId}`, {
            ...jobData,
            status: 'failed',
            error: error.message,
        })
        await emit({
            topic: 'yt.titles.error',
            data: {
                jobId,
                email,
                error: "fail to improved titles for the videos. please try again later",
            },
        });
    }
}





















































































































































































































































