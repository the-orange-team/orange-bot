import { RespondArguments } from '@slack/bolt';
import main from './help-main.json';
import create from './help-create.json';
import cmdcrt from './help-cmdcrt.json';
import hidden from './help-hidden.json';
import deletion from './help-deletion.json';

export function generateHelpBlock(argument: string): RespondArguments {
    switch (argument) {
        case 'create':
            return create;
        case 'cmdcrt':
            return cmdcrt;
        case 'delete':
            return deletion;
        case 'hidden':
            return hidden;
        default:
            return main;
    }
}
