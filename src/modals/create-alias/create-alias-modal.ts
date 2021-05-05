import { SlashCommand } from '@slack/bolt';
import axios from 'axios';
import schema from './schema';

export async function getModal(payload: SlashCommand) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
        },
    };
    const body = {
        trigger_id: payload.trigger_id,
        view: schema,
    };

    const response = axios.post('https://slack.com/api/views.open', body, config);
    console.log(response);
    return response;
}
