import { bolaoCommandHandler, handleBolaoPredictModal } from '../../bolao/commands';
import fs from 'fs';
import axios from 'axios';

jest.mock('fs');
jest.mock('axios');

const mockClient = {
    views: {
        open: jest.fn(),
        update: jest.fn(),
    },
    chat: {
        postEphemeral: jest.fn(),
        postMessage: jest.fn(),
    },
    users: {
        info: jest.fn().mockResolvedValue({
            user: { profile: { display_name: 'Test User' }, real_name: 'Test User' },
        }),
    },
};

describe('/bolao predict', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockClient.views.open.mockResolvedValue({ view: { id: 'mockViewId' } });
    });

    it("shows tomorrow's matches in the modal", async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().slice(0, 10);

        (axios.get as jest.Mock).mockResolvedValueOnce({
            data: {
                events: [
                    {
                        idEvent: '123',
                        strHomeTeam: 'Team A',
                        strAwayTeam: 'Team B',
                        dateEvent: tomorrowStr,
                        strTime: '19:00:00',
                    },
                ],
            },
        });

        await bolaoCommandHandler({
            command: { text: 'predict', channel_id: 'C1', user_id: 'U1' },
            ack: jest.fn(),
            respond: jest.fn(),
            client: mockClient,
            body: { trigger_id: 'trigger' },
        } as any);

        expect(mockClient.views.open).toHaveBeenCalled();
        expect(mockClient.views.update).toHaveBeenCalled();
        const updateCall = mockClient.views.update.mock.calls[0][0];
        expect(
            updateCall.view.blocks.some((b: any) => b.label?.text?.includes('Team A vs Team B'))
        ).toBe(true);
    });

    it('shows warning if no matches for tomorrow', async () => {
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: { events: null } });

        await bolaoCommandHandler({
            command: { text: 'predict', channel_id: 'C1', user_id: 'U1' },
            ack: jest.fn(),
            respond: jest.fn(),
            client: mockClient,
            body: { trigger_id: 'trigger' },
        } as any);

        expect(mockClient.views.update).toHaveBeenCalled();
        const updateCall = mockClient.views.update.mock.calls[0][0];
        expect(updateCall.view.blocks[0].text.text).toMatch(/No matches available/);
    });
});

describe('/bolao leaderboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (fs.readFileSync as jest.Mock).mockReturnValue(
            JSON.stringify({ scores: [{ user: 'U1', points: 5 }] })
        );
    });

    it('shows leaderboard with user display name', async () => {
        const respond = jest.fn();
        await bolaoCommandHandler({
            command: { text: 'leaderboard', channel_id: 'C1', user_id: 'U1' },
            ack: jest.fn(),
            respond,
            client: mockClient,
            body: {},
        } as any);

        expect(respond).toHaveBeenCalledWith(expect.stringContaining('Test User'));
    });
});

describe('handleBolaoPredictModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ predictions: [] }));
        (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    });

    it('saves a valid prediction', async () => {
        const ack = jest.fn();
        const client = { chat: { postEphemeral: jest.fn() } };
        await handleBolaoPredictModal({
            ack,
            body: { user: { id: 'U1' }, view: { private_metadata: 'C1' } },
            view: {
                state: {
                    values: {
                        match_123: { score: { value: '2-1' } },
                    },
                },
            },
            client,
        } as any);

        expect(ack).toHaveBeenCalled();
        expect(fs.writeFileSync).toHaveBeenCalled();
        expect(client.chat.postEphemeral).toHaveBeenCalled();
    });
});
