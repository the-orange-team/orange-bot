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
                            text: 'Insira o nome do alias',
                        },
                    },
                    label: {
                        type: 'plain_text',
                        text: 'Alias',
                    },
                },
                {
                    type: 'input',
                    element: {
                        type: 'plain_text_input',
                        action_id: uuidv4(),
                        placeholder: {
                            type: 'plain_text',
                            text: 'Informe o que o alias responderá quando chamado',
                        },
                    },
                    label: {
                        type: 'plain_text',
                        text: 'Resposta',
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
                                text: 'Adicionar mais respostas',
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
