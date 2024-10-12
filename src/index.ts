import crypto from 'crypto';

function base64url(input: Buffer): string {
    return input.toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

export function encodeJWT(secret: string, id: string | number, payload: object, ttl?: number): string {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };
    const now = Math.floor(Date.now() / 1000);
    const extendedPayload = {
        ...payload,
        sub: id.toString(),
        exp: ttl ? now + ttl : undefined,
        iat: now
    };

    const encodedHeader = base64url(Buffer.from(JSON.stringify(header)));
    const encodedPayload = base64url(Buffer.from(JSON.stringify(extendedPayload)));

    const signature = crypto
        .createHmac('sha256', secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function decodeJWT(secret: string, token: string): { id: string, payload: object, expires_at: Date | null } {
    const [header, payload, signature] = token.split('.');

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${header}.${payload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    if (signature !== expectedSignature) {
        throw new Error('Invalid token');
    }

    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());

    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
        throw new Error('Token expired');
    }

    return {
        id: decodedPayload.sub,
        payload: decodedPayload,
        expires_at: decodedPayload.exp ? new Date(decodedPayload.exp * 1000) : null
    };
}

export function validateJWT(secret: string, token: string): boolean {
    try {
        decodeJWT(secret, token);
        return true;
    } catch (error) {
        return false;
    }
}

export function refreshJWT(secret: string, token: string, ttl: number): string {
    const { id, payload } = decodeJWT(secret, token);
    return encodeJWT(secret, id, payload, ttl);
}