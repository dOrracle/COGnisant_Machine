const TokenService = require('../../src/core/token-service');
test('issue and verify', () => {
const ts = new TokenService({ secret:'s', ttl:'1h' });
const token = ts.issue({ sub: 'test' });
const claims = ts.verify(token);
expect(claims.sub).toBe('test');
});