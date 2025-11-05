import {ApiRouteConfig} from 'motia';

// step -7:
// API endpoint to fetch all jobs for the dashboard
export const config: ApiRouteConfig = {
    name: "getJobs",
    type: "api",
    path: "/jobs",
    method: "GET",
    emits: [],
};

export const handler = async (req: any, {state, logger}: any) => {
    try {
        logger.info('Fetching all jobs for dashboard');

        // Get all keys that start with "job: "
        const allKeys = await state.keys('job:*');

        if (!allKeys || allKeys.length === 0) {
            return {
                status: 200,
                body: {
                    jobs: []
                }
            };
        }

        // Fetch all job data
        const jobs = [];
        for (const key of allKeys) {
            try {
                const jobData = await state.get(key);
                if (jobData) {
                    jobs.push(jobData);
                }
            } catch (error: any) {
                logger.warn(`Failed to fetch job data for key: ${key}`, {error: error.message});
            }
        }

        // Sort jobs by creation date (newest first)
        jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        logger.info(`Fetched ${jobs.length} jobs`);

        return {
            status: 200,
            body: {
                jobs
            }
        };
    } catch (error: any) {
        logger.error('Error fetching jobs', {error: error.message});
        return {
            status: 500,
            body: {
                error: "Internal server error",
            }
        };
    }
}