import './middlewares';
import { app } from './app';
import { initializeCronJobs } from './middlewares/cronjobs';

(async () => {
    const PORT = Number(process.env.PORT) || 3000;
    await app.start(PORT);
    console.log(`🟠 Orange Bot started on port ${PORT}`);
    console.log(`⏱️Scheduling cron jobs`);
    await initializeCronJobs();
})();
