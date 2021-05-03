import { SlackCommandMiddlewareArgs, Middleware } from '@slack/bolt';

export function callAuthorized(
    listener: (...args: SlackCommandMiddlewareArgs[]) => any
): (...args: SlackCommandMiddlewareArgs[]) => any {
    return ({ payload, command, body, say, respond, ack }) => {
        console.log('intercepted');
        listener({ payload, command, body, say, respond, ack });
    };
}
