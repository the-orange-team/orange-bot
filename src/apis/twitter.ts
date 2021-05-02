import Twitter from 'twitter';

const client = new Twitter({
    consumer_key: process.env.TWITTER_API_KEY ?? '',
    consumer_secret: process.env.TWITTER_API_SECRET_KEY ?? '',
    bearer_token: process.env.TWITTER_BEARER_TOKEN ?? '',
});

export { client };
