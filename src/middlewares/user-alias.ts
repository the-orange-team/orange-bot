import { SlackCommandMiddlewareArgs, Middleware } from '@slack/bolt';

export const callAuthorized: Middleware<SlackCommandMiddlewareArgs> = async ({
    next,
    ack,
    ...rest
}) => {
    console.log('intercepted');
    await next?.();
};
