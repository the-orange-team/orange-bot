import { app } from '../app';
import { v4 as uuidv4 } from 'uuid';
import { View } from '@slack/bolt';

app.action('add_option', async ({ body, client, context }) => {
    context.sendEphemeral('Adding more options');
    if (body.type !== 'block_actions' || !body.view) return;

    try {
        const {
            blocks,
            id,
            team_id,
            state,
            hash,
            previous_view_id,
            root_view_id,
            app_id,
            bot_id,

            ...previousViewValues
        } = body.view;

        const result = await client.views.update({
            view_id: body.view?.id,
            hash: body?.view?.hash,
            view: {
                ...previousViewValues,

                close: previousViewValues.close ?? undefined,
                submit: previousViewValues.submit ?? undefined,

                type: 'modal',
                blocks: blocks.concat({
                    type: 'input',
                    element: {
                        type: 'plain_text_input',
                        action_id: uuidv4(),
                        placeholder: {
                            type: 'plain_text',
                            text: 'Enter the value to be returned',
                        },
                    },
                    label: {
                        type: 'plain_text',
                        text: 'Value',
                    },
                }),
            },
        });
        console.log(result);
    } catch (error) {
        console.error(error);
    }
});
