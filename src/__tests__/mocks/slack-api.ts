import { SlashCommand } from '@slack/bolt';

export const buildSlashcommand = (text: string, userId: string): SlashCommand => {
    return {
        api_app_id: '',
        channel_id: '',
        channel_name: '',
        command: '/create',
        response_url: '',
        team_domain: 'orange',
        team_id: '',
        text: text,
        token: 'some token',
        trigger_id: '',
        user_id: userId,
        user_name: 'krumbaschneidschie',
    };
};
