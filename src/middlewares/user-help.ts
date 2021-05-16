import { app } from '../app';
import { generateHelpBlock } from '../static-blocks/help/index';

const tag = 'user-help';

app.command('/help', async ({ command, context }) => {
    const [helpArgument] = command.text.trim().split(' ');
    context.logStep(tag, 'received');
    await context.sendComposedEphemeral(generateHelpBlock(helpArgument));
});
