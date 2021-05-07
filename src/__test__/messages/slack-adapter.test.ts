import * as adapter from '../../messages/slack-adapter';

describe('textToSlackMessage', () => {
    test('Given a text return the text', () => {
        expect(adapter.textToSlackMessage(':some-command', 'some text')).toEqual('some text');
    });
});
