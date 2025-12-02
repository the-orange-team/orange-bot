import './middlewares';
import { app, discordAdapter, isDiscordEnabled } from './app';
import { initializeCronJobs } from './middlewares/cronjobs';

(async () => {
    const PORT = Number(process.env.PORT) || 3000;

    // Start Slack bot
    await app.start(PORT);
    console.log(`🟠 Orange Bot (Slack) started on port ${PORT}`);

    // Start Discord bot if configured
    if (isDiscordEnabled()) {
        try {
            await discordAdapter.start();
            console.log('🎮 Orange Bot (Discord) started');
        } catch (error) {
            console.error('❌ Failed to start Discord bot:', error);
            console.log(
                '💡 Discord bot disabled. Set DISCORD_TOKEN and DISCORD_CLIENT_ID to enable.'
            );
        }
    } else {
        console.log('💡 Discord bot disabled. Set DISCORD_TOKEN and DISCORD_CLIENT_ID to enable.');
    }

    console.log(`⏱️ Scheduling cron jobs`);
    await initializeCronJobs();
})();
