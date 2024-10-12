import { encodeJWT, decodeJWT, validateJWT, refreshJWT } from '../index';

const secret = 'test_secret';
const id = '123';
const payload = { role: 'admin' };
const ttl = 60;

test('encodeJWT should create a valid JWT', () => {
    const token = encodeJWT(secret, id, payload, ttl);
    expect(typeof token).toBe('string');
    const parts = token.split('.');
    expect(parts.length).toBe(3);
});

test('decodeJWT should decode a valid JWT', () => {
    const token = encodeJWT(secret, id, payload, ttl);
    const decoded = decodeJWT(secret, token);
    expect(decoded.id).toBe(id);
    expect((decoded.payload as { role: string }).role).toBe(payload.role);
});

test('validateJWT should return true for a valid JWT', () => {
    const token = encodeJWT(secret, id, payload, ttl);
    expect(validateJWT(secret, token)).toBe(true);
});

test('validateJWT should return false for an invalid JWT', () => {
    expect(validateJWT(secret, 'invalid_token')).toBe(false);
});

test('decodeJWT should throw an error for expired token', () => {
    const token = encodeJWT(secret, id, payload, 1); // 1 second TTL
    setTimeout(() => {
        expect(() => decodeJWT(secret, token)).toThrow('Token expired');
    }, 2000); // Wait for 2 seconds to ensure the token is expired
});

test('refreshJWT should create a new token with extended expiration', () => {
    const token = encodeJWT(secret, id, payload, ttl);
    const newToken = refreshJWT(secret, token, ttl * 2);
    const decoded = decodeJWT(secret, newToken);
    expect(decoded.id).toBe(id);
    expect((decoded.payload as { role: string }).role).toBe(payload.role);
    expect(decoded.expires_at).toBeInstanceOf(Date);
});