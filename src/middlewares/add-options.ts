import { app } from '../app';
import { v4 as uuidv4 } from 'uuid';

// Listen for a button invocation with action_id `button_abc` (assume it's inside of a modal)
app.action({ type: 'block_actions', action_id: 'add_option' }, async ({ ack, body, client }) => {
    // Acknowledge the button request
    await ack();

    try {
        // Call views.update with the built-in client
        const result = await client.views.update({
            // Pass the view_id
            view_id: body?.view?.id,
            // Pass the current hash to avoid race conditions
            hash: body?.view?.hash,
            // View payload with updated blocks
            view: {
                type: 'modal',
                // View identifier
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
    } catch (error) {
        console.error(error);
    }
});
