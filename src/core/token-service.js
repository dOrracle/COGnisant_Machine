const jwt = require('jsonwebtoken');
class TokenService {
constructor({ secret = 'dev-secret', ttl = '5m' } = {}) {
this.secret = secret;
this.ttl = ttl;
}
issue(claims = {}) {
return jwt.sign(claims, this.secret, { expiresIn: this.ttl });
}
verify(token) {
try {
return jwt.verify(token, this.secret);
} catch(e){
return null;
}
}
}
module.exports = TokenService;