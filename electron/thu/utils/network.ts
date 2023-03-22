import _fetch from 'cross-fetch';
import { decode } from 'iconv-lite';
import { ApiError } from './exception';

interface CookieContent {
    [key: string]: string;
}
interface CookieJar {
    [key: string]: CookieContent;
}
interface fetchOptions {
    method: string;
    headers?: HeadersInit;
    body?: BodyInit;
}
interface Payload {
    [key: string]: string;
}
interface Credential {
    username: string;
    password: string;
}

const headers = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.41'
};

function cookieParser(cookie?: string): CookieContent {
    if (!cookie) return {};
    const nonCookieField = [
        'expires',
        'max-age',
        'domain',
        'path',
        'secure',
        'httponly',
        'samesite'
    ];
    return cookie.split(';').reduce((acc: CookieContent, curr: string) => {
        const [key, value] = curr.split('=');
        if (nonCookieField.indexOf(key.trim().toLowerCase()) !== -1) return acc;
        return { ...acc, [key.split(',').at(-1)!.trim()]: value };
    }, {});
}

function cookieBuilder(cookieJar: CookieContent): string {
    return Object.keys(cookieJar)
        .reduce((acc, curr) => {
            return `${acc}; ${curr}=${cookieJar[curr]}`;
        }, '')
        .slice(2);
}

async function autoDecode(res: Response) {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.toUpperCase().includes('GBK'))
        return decode(Buffer.from(await res.arrayBuffer()), 'gbk');
    return res.text();
}

async function base64Encode(res: Response) {
    return res.arrayBuffer().then((buf) => Buffer.from(buf).toString('base64'));
}

function encodeFormData(payload: Payload): string {
    const ret = Object.keys(payload).reduce((acc, curr) => {
        return `${acc}&${curr}=${payload[curr]}`;
    }, '');
    return ret.slice(1);
}

class Session {
    cookie: CookieJar;
    headers: HeadersInit;
    constructor(headers_: HeadersInit = {}, cookie: CookieJar = {}) {
        this.cookie = cookie;
        this.headers = { ...headers, ...headers_ };
    }

    async fetch(
        url: string,
        options: fetchOptions = { method: 'GET' }
    ): Promise<Response> {
        const site = new URL(url).hostname;
        if (this.cookie[site] === undefined) this.cookie[site] = {};
        return new Promise<Response>((resolve, reject) => {
            _fetch(url, {
                method: options.method,
                redirect: 'manual',
                headers: {
                    ...this.headers,
                    ...options.headers,
                    Cookie: cookieBuilder(this.cookie[site])
                },
                credentials: 'include',
                body: options.body === undefined ? null : options.body
            }).then((res) => {
                this.cookie[site] = {
                    ...this.cookie[site],
                    ...cookieParser(res.headers.get('set-cookie')!)
                };
                if (res.status === 302)
                    resolve(this.fetch(res.headers.get('location')!, options));
                else if (res.status >= 400)
                    reject(new ApiError(res.status));
                else resolve(res);
            });
        });
    }

    async post(
        url: string,
        payload: Payload,
        method: 'json' | 'form' = 'json'
    ): Promise<Response> {
        let contentType: string, body: string;
        if (method === 'form')
            [contentType, body] = [
                'application/x-www-form-urlencoded',
                encodeFormData(payload)
            ];
        else if (method === 'json')
            [contentType, body] = ['application/json', JSON.stringify(payload)];
        else throw new Error('Invalid method');
        return this.fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': contentType,
                ...this.headers
            },
            body: body
        });
    }

    async query(url: string, query?: Payload): Promise<Response> {
        const queryURL =
            query === undefined ? url : `${url}?${encodeFormData(query)}`;
        return this.fetch(queryURL, { method: 'GET', headers: this.headers });
    }

    reset() {
        this.cookie = {};
    }
}

class BaseHelper {
    _session: Session;

    constructor() {
        this._session = new Session();
        this._session.headers = {
            ...this._session.headers,
            Connection: 'keep-alive'
        };
    }

    _handle(result: 'plain' | 'base64' = 'plain') {
        return result === 'plain' ? autoDecode : base64Encode;
    }

    async query(
        url: string,
        query?: { [key: string]: string },
        result: 'plain' | 'base64' = 'plain'
    ) {
        return await this._session.query(url, query).then(this._handle(result));
    }

    async post(
        url: string,
        body?: { [key: string]: string },
        method: 'json' | 'form' = 'json',
        result: 'plain' | 'base64' = 'plain'
    ) {
        return await this._session
            .post(url, body === undefined ? {} : body, method)
            .then(this._handle(result));
    }
}

export type { Credential };
export { Session, autoDecode, base64Encode, BaseHelper };
export default {
    Session: Session,
    autoDecode: autoDecode,
    base64Encode: base64Encode,
    BaseHelper: BaseHelper
};
