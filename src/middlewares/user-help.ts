import { app } from '../app';
import main from '../blocks/help/help-main.json';

const tag = 'user-help';

app.command('/help', async ({ context }) => {
    context.logStep(tag, 'received');
    await context.sendComposedEphemeral(main);
});
