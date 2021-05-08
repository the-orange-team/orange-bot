import giphy from 'giphy-api';
const giphyClient = giphy(process.env.GIPHY_API_KEY);

export { giphyClient };
