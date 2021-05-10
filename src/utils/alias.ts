import { SlackViewAction } from '@slack/bolt';
import { ViewBlock, Maybe } from './types';
import { Alias } from '../messages';

const getBlockValue = (block: ViewBlock): string => Object.values(block)[0].value;

export const parseViewDataToAlias = ({ view, user }: SlackViewAction): Maybe<Alias> => {
    const [title, ...values] = Object.values(view.state.values).map(getBlockValue);
    if (!title) return null;

    return {
        text: title.toLowerCase(),
        userId: user.id,
        values,
    };
};
