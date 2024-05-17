import { extractUrl, getHost, replaceHostname } from '../../utils/url-util';

describe('extractUrl', () => {
    it('should extract the URL from the given text', () => {
        const text = 'Check out this website: https://example.com';
        const expectedUrl = 'https://example.com';
        const extractedUrl = extractUrl(text);
        expect(extractedUrl).toBe(expectedUrl);
    });

    it('should return null if no URL is found in the text', () => {
        const text = 'This is just a plain text without any URL';
        const extractedUrl = extractUrl(text);
        expect(extractedUrl).toBeNull();
    });
});

describe('getHost', () => {
    it('should return the hostname of the given URL', () => {
        const url = 'https://example.com/path/to/resource';
        const expectedHost = 'example.com';
        const host = getHost(url);
        expect(host).toBe(expectedHost);
    });
});

describe('replaceHostname', () => {
    it('should replace the hostname of the given URL with the new hostname', () => {
        const url = 'https://example.com/path/to/resource';
        const newHostname = 'newexample.com';
        const expectedUrl = 'https://newexample.com/path/to/resource';
        const replacedUrl = replaceHostname(url, newHostname);
        expect(replacedUrl).toBe(expectedUrl);
    });
});