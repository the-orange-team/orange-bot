export function extractUrl(text: string): string | null {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const result = text.match(urlRegex);
    return result ? result[0] : null;
}

export function getHost(url: string): string {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
}

export function replaceHostname(url: string, newHostname: string): string {
    const urlObj = new URL(url);
    urlObj.hostname = newHostname;
    return urlObj.href;
}