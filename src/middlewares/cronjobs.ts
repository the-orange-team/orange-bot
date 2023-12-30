import { scheduleFreeGamesJob } from './free-epic-games';

export async function initializeCronJobs() {
    await scheduleFreeGamesJob();
}