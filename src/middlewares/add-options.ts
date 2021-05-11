import { app } from '../app';
import { v4 as uuidv4 } from 'uuid';

app.action(
    { type: 'block_actions', action_id: 'add_option' },
    async ({ body, client, context }) => {
        try {
            const result = await client.views.update({
                view_id: body?.view?.id,
                hash: body?.view?.hash,
                view: {
                    type: 'modal',
                    callback_id: 'create_alias_view',
                    title: {
                        type: 'plain_text',
                        text: 'Updated modal',
                    },
                    blocks: [
                        {
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
                        },
                        {
                            type: 'image',
                            image_url: 'https://media.giphy.com/media/SVZGEcYt7brkFUyU90/giphy.gif',
                            alt_text: 'Yay! The modal was updated',
                        },
                    ],
                },
            });
            console.log(result);
            context.sendEphemeral('Adding more options');
        } catch (error) {
            console.error(error);
        }
    }
);
