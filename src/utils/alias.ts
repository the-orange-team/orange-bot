import { SlackViewAction, ViewStateValue } from '@slack/bolt';
import { ViewBlock, Maybe } from './types';
import { Alias } from '../messages';

export const getViewBlockValue = (block: { [actionId: string]: ViewStateValue; }): string => Object.values(block)[0].value!;

export const parseViewDataToAlias = ({ view, user }: SlackViewAction): Maybe<Alias> => {
    const [title, ...values] = Object.values(view.state.values).map(getViewBlockValue).filter((value) => value);
    if (!title) return null;

    return {
        text: title.toLowerCase(),
        userId: user.id,
        values,
    };
};
