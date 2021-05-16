import { RespondArguments } from '@slack/bolt';
import main from './help-main.json';

export function generateHelpBlock(argument: string): RespondArguments {
    switch (argument) {
        default:
            return main;
    }
}
