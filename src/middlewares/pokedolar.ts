import Twitter from 'twitter';
import { app } from '../app';
import { textToSlackMessage } from '../messages';

app.message('pokedolar', async ({ say }) => {
    const client = new Twitter({
        consumer_key: process.env.TWITTER_API_KEY ?? '',
        consumer_secret: process.env.TWITTER_API_SECRET_KEY ?? '',
        bearer_token: process.env.TWITTER_BEARER_TOKEN ?? '',
    });

    const params = { screen_name: 'PokeDolar', count: 1, exclude_replies: true };

    client.get('statuses/user_timeline', params, async function (error, tweets) {
        if (!error) {
            const tweet = tweets[0]?.text;
            const mediaUrl = tweets[0]?.entities?.media[0]?.media_url_https;

            const payload = {
                text: tweet,
                blocks: [
                    {
                        type: 'image',
                        title: {
                            type: 'plain_text',
                            text: tweet,
                        },
                        block_id: 'twitter_image',
                        image_url: mediaUrl,
                        alt_text: 'piece of pokemon',
                    },
                ],
            };

            await say(payload);
            // } catch (error) {
            //     await say('Failed to fetch last tweet.');
            //     app.error(error);
            // }
        }
    });
});
