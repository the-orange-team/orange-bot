import { SlashCommand } from '@slack/bolt';
import { ViewsOpenArguments } from '@slack/web-api';
import { v4 as uuidv4 } from 'uuid';

function getModalSchema(body: SlashCommand): ViewsOpenArguments {
    return {
        trigger_id: body.trigger_id,
        view: {
            title: {
                type: 'plain_text',
                text: 'Create your alias',
            },
            type: 'modal',
            blocks: [
                {
                    type: 'input',
                    element: {
                        type: 'plain_text_input',
                        action_id: 'title',
                        placeholder: {
                            type: 'plain_text',
                            text: 'Input the command',
                        },
                    },
                    label: {
                        type: 'plain_text',
                        text: 'Command',
                    },
                },
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
                    type: 'actions',
                    elements: [
                        {
                            type: 'button',
                            action_id: 'add_option',
                            text: {
                                type: 'plain_text',
                                text: 'Add another option  ',
                            },
                        },
                    ],
                },
            ],
            callback_id: 'create_alias_view',
            submit: {
                type: 'plain_text',
                text: 'Submit',
            },
        },
    };
}

export { getModalSchema };
