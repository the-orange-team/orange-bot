const payload = {
    title: {
        type: 'plain_text',
        text: 'Create your alias',
    },
    submit: {
        type: 'plain_text',
        text: 'Submit',
    },
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
                action_id: 'option_1',
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
    type: 'modal',
};

export default { payload };
